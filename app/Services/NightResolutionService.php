<?php

namespace App\Services;

use App\Enums\KillerAction;
use App\GameState;

class NightResolutionService
{
    public function resolve(GameState $game): array
    {
        $round = $game->currentRound();

        if (!$round) {
            $roundId = $game->addRound([
                'round_number' => $game->current_round,
                'killer_action' => null,
                'killer_target_npc_id' => null,
                'guardian_target_npc_id' => null,
                'kill_blocked' => false,
                'hint_npc_id' => null,
                'eliminated_player_id' => null,
            ]);
            $round = $game->currentRound();
        }

        $actions = $game->nightActionsForRound($game->current_round);

        $killerAction = null;
        $guardianAction = null;
        foreach ($actions as $a) {
            if ($a['action_type'] === 'kill' || $a['action_type'] === 'threaten') {
                $killerAction = $a;
            }
            if ($a['action_type'] === 'protect') {
                $guardianAction = $a;
            }
        }

        $roundUpdate = [];

        if ($killerAction) {
            $targetNpcId = $killerAction['target_npc_id'];

            if ($killerAction['action_type'] === 'kill') {
                $roundUpdate['killer_action'] = KillerAction::Kill->value;
                $roundUpdate['killer_target_npc_id'] = $targetNpcId;

                if ($guardianAction && $guardianAction['target_npc_id'] === $targetNpcId) {
                    $roundUpdate['guardian_target_npc_id'] = $guardianAction['target_npc_id'];
                    $roundUpdate['kill_blocked'] = true;
                } else {
                    if ($guardianAction) {
                        $roundUpdate['guardian_target_npc_id'] = $guardianAction['target_npc_id'];
                    }
                    $game->updateNpc($targetNpcId, ['is_alive' => false]);
                }
            } elseif ($killerAction['action_type'] === 'threaten') {
                $roundUpdate['killer_action'] = KillerAction::Threaten->value;
                $roundUpdate['killer_target_npc_id'] = $targetNpcId;

                if ($guardianAction) {
                    $roundUpdate['guardian_target_npc_id'] = $guardianAction['target_npc_id'];
                }

                $game->updateNpc($targetNpcId, ['is_threatened' => true]);
            }
        }

        // Pick hint NPC — if threatened, the threatened NPC speaks (fuorviante)
        if ($killerAction && $killerAction['action_type'] === 'threaten') {
            $roundUpdate['hint_npc_id'] = $killerAction['target_npc_id'];
        } else {
            $hintNpc = $this->selectHintNpc($game);
            if ($hintNpc) {
                $roundUpdate['hint_npc_id'] = $hintNpc['id'];
            }
        }

        $game->updateRound($round['id'], $roundUpdate);

        // Return the updated round
        return $game->currentRound();
    }

    private function selectHintNpc(GameState $game): ?array
    {
        $aliveNpcs = $game->aliveNpcs();
        if (empty($aliveNpcs)) {
            return null;
        }

        // If only one NPC alive, must use it
        if (count($aliveNpcs) === 1) {
            return $aliveNpcs[0];
        }

        // Find the NPC that spoke last round (to exclude it)
        $lastHintNpcId = null;
        $rounds = $game->rounds ?? [];
        foreach ($rounds as $r) {
            if ($r['round_number'] === $game->current_round - 1 && !empty($r['hint_npc_id'])) {
                $lastHintNpcId = $r['hint_npc_id'];
            }
        }

        // Exclude the NPC that spoke last round
        $candidates = array_values(array_filter($aliveNpcs, fn ($n) => $n['id'] !== $lastHintNpcId));

        // Prefer NPCs that haven't spoken yet
        $usedNpcIds = $game->roundHintNpcIds();
        $unused = array_filter($candidates, fn ($n) => !in_array($n['id'], $usedNpcIds));

        if (!empty($unused)) {
            $unused = array_values($unused);
            return $unused[array_rand($unused)];
        }

        if (!empty($candidates)) {
            return $candidates[array_rand($candidates)];
        }

        return $aliveNpcs[array_rand($aliveNpcs)];
    }
}
