<?php

namespace App\Services;

use App\Enums\PlayerRole;
use App\GameState;

class RoleAssignmentService
{
    // [killers, guardians, mediums, analysts, citizens]
    private const DISTRIBUTION = [
        4  => [1, 1, 0, 0, 2],
        5  => [1, 1, 0, 0, 3],
        6  => [1, 1, 0, 1, 3],
        7  => [2, 1, 1, 1, 2],
        8  => [2, 1, 1, 1, 3],
        9  => [2, 1, 1, 1, 4],
        10 => [3, 1, 1, 1, 4],
    ];

    public function assign(GameState $game): void
    {
        $count = $game->player_count;
        $dist = self::DISTRIBUTION[$count] ?? self::DISTRIBUTION[6];

        $roles = [];
        $roles = array_merge($roles, array_fill(0, $dist[0], PlayerRole::SerialKiller->value));
        $roles = array_merge($roles, array_fill(0, $dist[1], PlayerRole::Guardian->value));
        $roles = array_merge($roles, array_fill(0, $dist[2], PlayerRole::Medium->value));
        $roles = array_merge($roles, array_fill(0, $dist[3], PlayerRole::Analyst->value));
        $roles = array_merge($roles, array_fill(0, $dist[4], PlayerRole::Citizen->value));

        shuffle($roles);

        $players = $game->players();
        usort($players, fn ($a, $b) => $a['sort_order'] <=> $b['sort_order']);

        foreach ($players as $i => $player) {
            $game->updatePlayer($player['id'], ['role' => $roles[$i]]);
        }
    }
}
