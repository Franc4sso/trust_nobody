<?php

namespace App\Services;

use App\Enums\GamePhase;
use App\Enums\PlayerRole;
use App\GameState;

class WinConditionService
{
    public function check(GameState $game): ?string
    {
        $aliveKillers = count($game->aliveKillers());
        $aliveNpcs = count($game->aliveNpcs());

        // Citizens win if all killers are eliminated
        if ($aliveKillers === 0) {
            return 'citizens';
        }

        // Killers win if all NPCs are dead
        if ($aliveNpcs === 0) {
            return 'killers';
        }

        // Killers win if alive non-killer players <= alive killers (after a vote)
        $alivePlayers = $game->alivePlayers();
        $aliveCitizens = count(array_filter($alivePlayers, fn ($p) => $p['role'] !== PlayerRole::SerialKiller->value));

        if ($aliveCitizens <= $aliveKillers) {
            return 'killers';
        }

        return null;
    }

    public function applyIfOver(GameState $game): ?string
    {
        $winner = $this->check($game);
        if ($winner) {
            $game->update([
                'winner' => $winner,
                'current_phase' => GamePhase::GameOver->value,
            ]);
        }
        return $winner;
    }
}
