<?php

namespace App\Services;

use App\GameState;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NpcGeneratorService
{
    private const NPC_COUNT = [
        4 => 3, 5 => 4, 6 => 4, 7 => 5, 8 => 5, 9 => 6, 10 => 6,
    ];

    /**
     * Templates per personality: how this NPC knows a person.
     * Each template uses {name} as placeholder.
     */
    private const CONNECTION_TEMPLATES = [
        'librarian' => [
            '{name} viene spesso a consultare i miei libri... e a sussurrare segreti tra gli scaffali.',
            'Ho trovato il nome di {name} scritto a margine di un vecchio diario. Curioso, no?',
            '{name} mi ha chiesto di cercare un tomo proibito. Non ho mai dimenticato quello sguardo.',
            '{name} passa ore nella mia biblioteca. A volte mi chiedo cosa stia davvero cercando.',
        ],
        'merchant' => [
            '{name} è uno dei miei clienti più assidui. Paga sempre in contanti, mai domande.',
            'Faccio affari con {name} da tempo. Conosco i suoi debiti e i suoi segreti.',
            '{name} mi ha chiesto di procurare qualcosa di... insolito. Il denaro parla.',
            'Ho visto {name} al mercato nero. Non mi ha visto — o finge di non avermi visto.',
        ],
        'herbalist' => [
            '{name} viene a comprare le mie erbe. Ultimamente chiede rimedi per l\'insonnia.',
            'Dal mio giardino ho visto {name} passare a notte fonda. Dove andava?',
            '{name} mi ha chiesto un preparato strano. Non ho fatto domande, ma ci penso ancora.',
            'Curo {name} da tempo. Conosco il suo corpo e i suoi segreti meglio di chiunque altro.',
        ],
        'astronomer' => [
            'Dalla mia torre ho visto {name} camminare sotto le stelle. Non era solo.',
            '{name} mi ha chiesto di leggere il suo oroscopo. Le stelle non mentono mai.',
            'Le notti sono lunghe quassù. E ho visto {name} fare cose che gli altri non sanno.',
            '{name} è salito in torre a chiedermi consiglio. Aveva paura di qualcosa — o di qualcuno.',
        ],
        'blacksmith' => [
            '{name} mi ha commissionato un\'arma. Diceva per difesa. Ma da cosa?',
            'Lavoro il ferro per {name} da anni. Conosco la forza delle sue mani e delle sue bugie.',
            '{name} è passato dalla mia fucina a un\'ora sospetta. Il fuoco rivela molto dei volti.',
            'Ho forgiato qualcosa per {name}. Non posso dire cosa, ma non era un attrezzo da lavoro.',
        ],
        'innkeeper' => [
            '{name} beve alla mia locanda ogni sera. L\'alcol scioglie la lingua...',
            'Ho sentito {name} parlare troppo dopo il terzo bicchiere. Cose che non dovrei sapere.',
            '{name} si ferma sempre al mio bancone. Mi racconta tutto — forse troppo.',
            'Alla mia locanda passano tutti. {name} più degli altri. E sempre con aria preoccupata.',
        ],
        'weaver' => [
            '{name} mi porta i suoi vestiti da rammendare. Sulle stoffe rimangono tracce...',
            'Mentre tessevo ho sentito {name} parlare con qualcuno nell\'ombra. Non ho visto chi.',
            '{name} mi ha chiesto un mantello scuro. Per nascondersi dalla pioggia, ha detto.',
            'I fili che intrecccio e i pettegolezzi che raccolgo — {name} compare in entrambi.',
        ],
        'hunter' => [
            'Ho incrociato {name} nel bosco. A quell\'ora, nessuno esce per funghi.',
            'Le tracce non mentono. Ho seguito quelle di {name} fino a un posto strano.',
            '{name} ha le stesse abitudini di una preda che si nasconde. Lo osservo da tempo.',
            'Nel bosco ho trovato qualcosa che appartiene a {name}. Non doveva essere lì.',
        ],
        'healer' => [
            'Ho curato le ferite di {name}. Alcune non erano ferite accidentali.',
            '{name} viene da me di notte, quando nessuno lo vede. Ha qualcosa da nascondere.',
            'Conosco il battito del cuore di {name}. Ultimamente è più veloce del solito.',
            '{name} mi ha chiesto un rimedio per le mani tremanti. Non è il freddo a farlo tremare.',
        ],
        'elder' => [
            'Conosco {name} fin da quando era bambino. Qualcosa in quegli occhi è cambiato.',
            '{name} mi ha chiesto consiglio. Ma non credo abbia seguito il mio avvertimento.',
            'Ho visto generazioni passare. {name} mi ricorda qualcuno che ho conosciuto — e temuto.',
            '{name} viene a trovarmi spesso. Forse cerca la mia approvazione, o forse il mio silenzio.',
        ],
    ];

    public function generate(GameState $game): void
    {
        $archetypes = require database_path('data/npc_archetypes.php');
        shuffle($archetypes);

        $count = self::NPC_COUNT[$game->player_count] ?? 4;
        $selected = array_slice($archetypes, 0, $count);

        $allPlayers = $game->players();

        foreach ($selected as $archetype) {
            $shuffled = $allPlayers;
            shuffle($shuffled);
            $connCount = rand(2, min(4, count($shuffled)));
            $connectedPlayers = array_slice($shuffled, 0, $connCount);
            $connections = array_column($connectedPlayers, 'id');

            $connectionDescriptions = $this->generateDescriptionsWithAI($archetype, $connectedPlayers)
                ?? $this->generateDescriptionsFromTemplates($archetype['personality'], $connectedPlayers);

            $game->addNpc([
                'name' => $archetype['name'],
                'personality' => $archetype['personality'],
                'connections' => $connections,
                'connection_descriptions' => $connectionDescriptions,
            ]);
        }
    }

    private function generateDescriptionsWithAI(array $archetype, array $connectedPlayers): ?array
    {
        $apiKey = config('services.groq.key');
        if (!$apiKey) {
            return null;
        }

        $playerNames = array_map(fn($p) => $p['name'], $connectedPlayers);
        $namesStr = implode(', ', $playerNames);

        $prompt = <<<PROMPT
Sei {$archetype['name']}, un personaggio in un gioco sociale di deduzione ambientato in un villaggio medievale.
Il tuo ruolo è: {$archetype['personality']}.
La tua storia: {$archetype['backstory']}

Devi descrivere brevemente come conosci ognuna di queste persone del villaggio: {$namesStr}.

Regole:
- Una frase per persona, in prima persona, in italiano
- Tono misterioso e leggermente inquietante, coerente col tuo ruolo
- Non rivelare se qualcuno è colpevole o innocente
- Rispondi SOLO con un oggetto JSON, senza markdown, nel formato:
{"nome_persona": "descrizione", ...}
PROMPT;

        try {
            $response = Http::timeout(15)
                ->withToken($apiKey)
                ->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model' => 'llama-3.3-70b-versatile',
                    'messages' => [
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'temperature' => 0.8,
                    'max_tokens' => 400,
                ]);

            if (!$response->successful()) {
                Log::warning('Groq API error', ['status' => $response->status()]);
                return null;
            }

            $text = $response->json('choices.0.message.content', '');
            $decoded = json_decode($text, true);

            if (!is_array($decoded)) {
                return null;
            }

            $result = [];
            foreach ($connectedPlayers as $player) {
                $desc = $decoded[$player['name']] ?? null;
                if (!$desc) {
                    return null; // fallback to templates if any name is missing
                }
                $result[] = [
                    'player_id' => $player['id'],
                    'text' => $desc,
                ];
            }

            return $result;
        } catch (\Throwable $e) {
            Log::warning('Groq API exception: ' . $e->getMessage());
            return null;
        }
    }

    private function generateDescriptionsFromTemplates(string $personality, array $connectedPlayers): array
    {
        $templates = self::CONNECTION_TEMPLATES[$personality] ?? self::CONNECTION_TEMPLATES['elder'];
        shuffle($templates);

        $result = [];
        foreach ($connectedPlayers as $i => $player) {
            $template = $templates[$i % count($templates)];
            $result[] = [
                'player_id' => $player['id'],
                'text' => str_replace('{name}', $player['name'], $template),
            ];
        }

        return $result;
    }
}
