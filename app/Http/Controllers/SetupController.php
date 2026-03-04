<?php

namespace App\Http\Controllers;

use App\Enums\PlayerRole;
use App\GameState;
use App\Services\GameSetupService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SetupController extends Controller
{
    public function __construct(
        private GameSetupService $setupService,
    ) {}

    public function store(Request $request)
    {
        $game = $this->setupService->createGame(6);
        return redirect()->route('game.setup.names', $game);
    }

    public function names(GameState $game)
    {
        return Inertia::render('Setup/PlayerNames', [
            'game' => $game->toArray(),
        ]);
    }

    public function storeNames(Request $request, GameState $game)
    {
        $request->validate([
            'names' => 'required|array|min:4|max:10',
            'names.*' => 'required|string|max:30',
        ]);

        $names = $request->input('names');
        $game->update(['player_count' => count($names)]);
        $this->setupService->addPlayers($game, $names);
        $this->setupService->finalize($game);

        return redirect()->route('game.show', $game);
    }

    public function roleReveal(GameState $game)
    {
        $players = array_map(fn ($p) => [
            'id' => $p['id'],
            'name' => $p['name'],
            'role' => $p['role'],
            'role_label' => $this->roleLabel(PlayerRole::from($p['role'])),
            'role_description' => $this->roleDescription(PlayerRole::from($p['role'])),
        ], $game->players());

        return Inertia::render('Setup/RoleReveal', [
            'game' => $game->toArray(),
            'players' => $players,
        ]);
    }

    private function roleLabel(PlayerRole $role): string
    {
        return match ($role) {
            PlayerRole::SerialKiller => 'Serial Killer',
            PlayerRole::Guardian => 'Guardiano',
            PlayerRole::Medium => 'Medium',
            PlayerRole::Analyst => 'Analista',
            PlayerRole::Citizen => 'Cittadino',
        };
    }

    private function roleDescription(PlayerRole $role): string
    {
        return match ($role) {
            PlayerRole::SerialKiller => 'Ogni notte puoi uccidere o minacciare un NPC. Elimina tutti gli NPC per vincere.',
            PlayerRole::Guardian => 'Ogni notte scegli un NPC da proteggere. Se il killer lo attacca, lo salvi.',
            PlayerRole::Medium => 'Quando un giocatore viene eliminato al voto, scopri privatamente il suo ruolo.',
            PlayerRole::Analyst => 'Una volta a partita, puoi attivare il tuo potere per ottenere un indizio extra la mattina successiva.',
            PlayerRole::Citizen => 'Osserva, discuti e vota. Trova i killer prima che sia troppo tardi.',
        };
    }
}
