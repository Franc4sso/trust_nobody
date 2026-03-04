<?php

namespace App\Services;

use App\Enums\GamePhase;
use App\GameState;

class GameSetupService
{
    public function __construct(
        private RoleAssignmentService $roleService,
        private NpcGeneratorService $npcService,
    ) {}

    public function createGame(int $playerCount): GameState
    {
        GameState::clear();

        return GameState::create([
            'player_count' => $playerCount,
            'current_phase' => GamePhase::Setup->value,
            'current_round' => 0,
        ]);
    }

    public function addPlayers(GameState $game, array $names): void
    {
        foreach ($names as $i => $name) {
            $game->addPlayer([
                'name' => trim($name),
                'sort_order' => $i,
            ]);
        }
    }

    public function finalize(GameState $game): void
    {
        $this->roleService->assign($game);
        $this->npcService->generate($game);

        $game->update(['current_phase' => GamePhase::RoleReveal->value]);
    }
}
