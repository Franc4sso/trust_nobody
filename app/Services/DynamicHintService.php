<?php

namespace App\Services;

use App\Enums\PlayerRole;
use App\GameState;

class DynamicHintService
{
    public function generateHint(GameState $game, array $npc, bool $isThreatened): string
    {
        $round = $game->current_round;
        $connections = $npc['connections'] ?? [];
        $players = $game->players();
        $playerNames = array_column($players, 'name', 'id');

        $connNames = array_map(fn ($id) => $playerNames[$id] ?? 'Sconosciuto', $connections);
        $killerIds = array_column($game->killers(), 'id');
        $connKillerIds = array_intersect($connections, $killerIds);
        $connInnocentIds = array_diff($connections, $killerIds);

        $knowsKiller = !empty($connKillerIds);

        if ($isThreatened) {
            return $this->threatenedHint($game, $connNames, $connKillerIds, $connInnocentIds, $playerNames);
        }

        if (!$knowsKiller) {
            return $this->innocentConnectionsHint($game, $connNames, $round);
        }

        return $this->killerConnectionsHint($game, $connNames, $connKillerIds, $connInnocentIds, $playerNames, $round);
    }

    /**
     * Analyst bonus: purely vote-pattern based, spreads suspicion on multiple people.
     */
    public function generateAnalystBonus(GameState $game, array $npc): string
    {
        $allRounds = $game->rounds ?? [];
        $playerNames = array_column($game->players(), 'name', 'id');
        $killerIds = array_column($game->killers(), 'id');

        // Collect all vote data across rounds
        $votePatterns = $this->analyzeVotePatterns($game, $playerNames, $killerIds);

        if ($votePatterns) {
            return $votePatterns;
        }

        // Fallback if not enough vote data
        $templates = [
            "Le votazioni finora non rivelano schemi chiari. Qualcuno è molto bravo a nascondersi nel voto.",
            "Ho analizzato ogni voto espresso... c'è qualcuno che vota sempre in modo strategico, ma non riesco ancora a capire chi.",
            "I pattern di voto sono confusi. Forse è proprio questo il piano del killer: creare caos nelle assemblee.",
        ];

        return $templates[array_rand($templates)];
    }

    private function analyzeVotePatterns(GameState $game, array $playerNames, array $killerIds): ?string
    {
        $allVotes = $game->votes ?? [];
        if (empty($allVotes)) {
            return null;
        }

        // Collect interesting patterns
        $patterns = [];

        // Pattern 1: who voted together (killers voting for same person as innocents)
        $votesByRound = [];
        foreach ($allVotes as $v) {
            $rn = $v['round_number'];
            $votesByRound[$rn][] = $v;
        }

        foreach ($votesByRound as $roundVotes) {
            // Group by target
            $byTarget = [];
            foreach ($roundVotes as $v) {
                $byTarget[$v['target_player_id']][] = $v['voter_player_id'];
            }

            foreach ($byTarget as $targetId => $voterIds) {
                if (count($voterIds) >= 2) {
                    $voterNamesList = array_map(fn ($id) => $playerNames[$id] ?? '?', $voterIds);
                    $targetName = $playerNames[$targetId] ?? '?';

                    // Mix killers and innocents among the voters mentioned
                    $hasKiller = !empty(array_intersect($voterIds, $killerIds));
                    $hasInnocent = !empty(array_diff($voterIds, $killerIds));

                    if ($hasKiller && $hasInnocent && count($voterIds) >= 2) {
                        $mentionedNames = implode(' e ', array_slice($voterNamesList, 0, 3));
                        $patterns[] = "Ho notato che {$mentionedNames} hanno votato insieme contro {$targetName}. Coincidenza o strategia?";
                    }
                }
            }
        }

        // Pattern 2: someone who never gets voted for (suspicious)
        $allTargeted = [];
        foreach ($allVotes as $v) {
            $allTargeted[$v['target_player_id']] = ($allTargeted[$v['target_player_id']] ?? 0) + 1;
        }
        $alivePlayers = $game->alivePlayers();
        $neverTargeted = [];
        foreach ($alivePlayers as $p) {
            if (!isset($allTargeted[$p['id']]) || $allTargeted[$p['id']] === 0) {
                $neverTargeted[] = $p;
            }
        }
        if (count($neverTargeted) >= 1 && count($neverTargeted) <= 3) {
            $names = array_map(fn ($p) => $p['name'], $neverTargeted);
            $nameList = implode(', ', $names);
            $patterns[] = "Strano: {$nameList} non ha mai ricevuto nemmeno un voto. Nessuno li sospetta... o nessuno osa accusarli?";
        }

        // Pattern 3: someone who changes target every round
        $voterTargets = [];
        foreach ($allVotes as $v) {
            $voterTargets[$v['voter_player_id']][] = $v['target_player_id'];
        }
        foreach ($voterTargets as $voterId => $targets) {
            if (count($targets) >= 2 && count(array_unique($targets)) === count($targets)) {
                $voterName = $playerNames[$voterId] ?? '?';
                // Only mention if this creates suspicion on multiple people
                $otherVoter = array_rand(array_diff_key($voterTargets, [$voterId => true]));
                $otherName = $otherVoter !== null ? ($playerNames[$otherVoter] ?? null) : null;
                if ($otherName) {
                    $patterns[] = "{$voterName} cambia bersaglio ad ogni votazione. Anche {$otherName} si comporta in modo strano durante i voti.";
                } else {
                    $patterns[] = "{$voterName} cambia bersaglio ad ogni votazione. Un comportamento del genere è sospetto.";
                }
            }
        }

        // Pattern 4: who voted to eliminate someone who turned out to be innocent
        $rounds = $game->rounds ?? [];
        foreach ($rounds as $r) {
            if (!empty($r['eliminated_player_id'])) {
                $eliminated = $game->findPlayer($r['eliminated_player_id']);
                if ($eliminated && $eliminated['role'] !== PlayerRole::SerialKiller->value) {
                    // Innocents were eliminated - who pushed for it?
                    $roundVotes = $game->votesForRound($r['round_number'], false);
                    $pushers = [];
                    foreach ($roundVotes as $v) {
                        if ($v['target_player_id'] === $eliminated['id']) {
                            $pushers[] = $playerNames[$v['voter_player_id']] ?? '?';
                        }
                    }
                    if (count($pushers) >= 2) {
                        $pusherList = implode(', ', array_slice($pushers, 0, 3));
                        $patterns[] = "{$pusherList} hanno spinto per eliminare {$eliminated['name']}, che era innocente. Chi di loro aveva interesse a farlo fuori?";
                    }
                }
            }
        }

        if (empty($patterns)) {
            return null;
        }

        return $patterns[array_rand($patterns)];
    }

    private function threatenedHint(GameState $game, array $connNames, array $connKillerIds, array $connInnocentIds, array $playerNames): string
    {
        // NPC minacciato: stesso tono degli indizi normali, ma punta su innocenti.
        // Deve essere INDISTINGUIBILE da un indizio vero.
        $round = $game->current_round;
        $alivePlayerIds = array_column($game->alivePlayers(), 'id');
        $aliveInnocentConnIds = array_values(array_intersect($connInnocentIds, $alivePlayerIds));
        $innocentNames = array_map(fn ($id) => $playerNames[$id], $aliveInnocentConnIds);

        // Costruisci una lista di nomi mista (innocenti vivi che conosce)
        // per rendere l'indizio simile a quelli veri che citano le connessioni
        if (count($innocentNames) >= 2) {
            shuffle($innocentNames);
            $name1 = $innocentNames[0];
            $name2 = $innocentNames[1];
            $name3 = $innocentNames[2] ?? null;
            $nameList = implode(', ', $innocentNames);

            if ($round <= 2) {
                // Primi turni: cita tutti gli innocenti che conosce
                $templates = [
                    "Ho visto {$nameList} aggirarsi la scorsa notte. Uno di loro nasconde qualcosa.",
                    "Tra le persone che conosco — {$nameList} — qualcuno non è chi dice di essere.",
                    "Conosco {$nameList}. Uno di loro mi mette a disagio, ma non saprei dire chi.",
                    "{$nameList}... li osservo da un po'. C'è qualcosa che non quadra in uno di loro.",
                ];
            } elseif ($round <= 4) {
                // Turni medi: cita almeno 3 se disponibili, altrimenti tutti
                $shortList = $name3 ? "{$name1}, {$name2} e {$name3}" : $nameList;
                $templates = [
                    "Tra {$nameList}, il cerchio si stringe. Osservate chi è più nervoso.",
                    "Qualcuno tra {$shortList} non dice tutta la verità. Ne sono certo.",
                    "Le mie osservazioni mi portano a sospettare di qualcuno tra {$shortList}. Ma chi?",
                    "Ho notato comportamenti strani tra {$shortList}. Qualcuno di loro nasconde qualcosa.",
                ];
            } else {
                // Turni finali: minimo 3 nomi — mai scendere sotto
                $shortList = $name3 ? "{$name1}, {$name2} o {$name3}" : "{$name1}, {$name2} o qualcun altro tra chi conosco";
                $templates = [
                    "Posso restringere: tra {$shortList}. Uno di loro mente.",
                    "Dopo tutto quello che ho visto, il colpevole è tra {$shortList}.",
                    "Sono quasi certo: {$shortList}. Uno di questi ha le mani sporche.",
                    "Vi dico solo questo: guardate bene {$shortList}. La risposta è lì.",
                ];
            }
        } elseif (count($innocentNames) === 1) {
            $name = $innocentNames[0];

            if ($round <= 2) {
                $templates = [
                    "Tra le persone che conosco, {$name} mi mette a disagio. Non saprei dire perché.",
                    "Ho osservato {$name} attentamente. C'è qualcosa che non torna.",
                ];
            } else {
                $templates = [
                    "Le mie osservazioni mi portano a sospettare di {$name}. Qualcosa non quadra.",
                    "Dopo tutto quello che ho visto, {$name} è in cima alla mia lista di sospetti.",
                ];
            }
        } else {
            // Non conosce innocenti vivi — indizi vaghi, stesso tono generico
            $templates = [
                "Non ho notato nulla di sospetto tra chi conosco. Ma qualcosa nell'aria è cambiato.",
                "Le votazioni dell'ultimo turno mi hanno fatto pensare. Qualcuno tra voi sta giocando sporco.",
                "Ho osservato tutti attentamente. Il pericolo è vicino, ma non riesco a capire da dove viene.",
                "Qualcosa non quadra nel villaggio. Non mi fido più di nessuno.",
                "La notte scorsa ho sentito dei passi. Qualcuno si muove nell'ombra, ma non so chi.",
            ];
        }

        return $templates[array_rand($templates)];
    }

    private function innocentConnectionsHint(GameState $game, array $connNames, int $round): string
    {
        $nameList = implode(', ', $connNames);

        $templates = [
            "Le persone che conosco — {$nameList} — mi sembrano tutte a posto. Il pericolo è altrove.",
            "Non ho notato nulla di sospetto tra chi conosco. Ma qualcosa nell'aria è cambiato.",
            "{$nameList}... li conosco bene, non credo che siano coinvolti. Il killer è qualcun altro.",
            "Ho osservato {$nameList} attentamente. Non mi sembrano pericolosi.",
        ];

        if ($round >= 2) {
            $templates[] = "Le votazioni dell'ultimo turno mi hanno fatto pensare. Qualcuno tra voi sta giocando sporco.";
            $templates[] = "Ho notato tensione durante le votazioni. Ma tra chi conosco — {$nameList} — nessuno mi sembra il colpevole.";
        }

        return $templates[array_rand($templates)];
    }

    private function killerConnectionsHint(GameState $game, array $connNames, array $connKillerIds, array $connInnocentIds, array $playerNames, int $round): string
    {
        $killerNames = array_map(fn ($id) => $playerNames[$id], array_values($connKillerIds));
        $innocentNames = array_map(fn ($id) => $playerNames[$id], array_values($connInnocentIds));
        $nameList = implode(', ', $connNames);

        if ($round <= 2) {
            // Primi turni: massima confusione, cita tutte le connessioni
            $templates = [
                "Ho visto {$nameList} aggirarsi la scorsa notte. Uno di loro nasconde qualcosa.",
                "Tra le persone che conosco — {$nameList} — qualcuno non è chi dice di essere.",
                "Conosco {$nameList}. Uno di loro mi mette a disagio, ma non saprei dire chi.",
                "{$nameList}... li osservo da un po'. C'è qualcosa che non quadra in uno di loro.",
            ];
        } elseif ($round <= 4) {
            // Turni medi: restringe ma cita almeno 3 nomi (killer + 2 innocenti se possibile)
            $killerName = $killerNames[0];
            shuffle($innocentNames);
            $extra = array_slice($innocentNames, 0, 2);

            if (count($extra) >= 2) {
                $shortList = implode(', ', array_merge([$killerName], $extra));
            } elseif (count($extra) === 1) {
                $shortList = "{$killerName}, {$extra[0]} e altri";
            } else {
                $shortList = $nameList;
            }

            $templates = [
                "Tra {$nameList}, il cerchio si stringe. Osservate chi è più nervoso.",
                "Qualcuno tra {$shortList} non dice tutta la verità. Ne sono certo.",
                "Le mie osservazioni mi portano a sospettare di qualcuno tra {$shortList}. Ma chi?",
                "Le vittime avevano tutte un collegamento con alcune delle persone che conosco. Pensateci bene.",
            ];
        } else {
            // Turni finali: minimo 3 nomi, killer + almeno 2 innocenti
            $killerName = $killerNames[0];
            shuffle($innocentNames);
            $extra = array_slice($innocentNames, 0, 2);

            if (count($extra) >= 2) {
                $name2 = $extra[0];
                $name3 = $extra[1];
                $shortList = "{$killerName}, {$name2} o {$name3}";
            } elseif (count($extra) === 1) {
                $name2 = $extra[0];
                $shortList = "{$killerName}, {$name2} o qualcun altro tra chi conosco";
            } else {
                // Solo killer nelle connessioni — usa tutti i connNames
                $shortList = $nameList;
            }

            $templates = [
                "Posso restringere: tra {$shortList}. Uno di loro mente.",
                "Dopo tutto quello che ho visto, il colpevole è tra {$shortList}.",
                "Sono quasi certo: {$shortList}. Uno di questi ha le mani sporche.",
                "Vi dico solo questo: guardate bene {$shortList}. La risposta è lì.",
            ];
        }

        return $templates[array_rand($templates)];
    }
}
