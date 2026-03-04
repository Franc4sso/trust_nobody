<?php

namespace App\Http\Controllers;

use App\GameState;
use App\Services\NightResolutionService;
use App\StateMachine\GameStateMachine;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NightController extends Controller
{
    public function __construct(
        private NightResolutionService $nightService,
        private GameStateMachine $stateMachine,
    ) {}

    public function show(GameState $game)
    {
        $killers = $game->aliveKillers();
        $guardians = $game->alivePlayersWithRole('guardian');
        $guardian = $guardians[0] ?? null;

        $analysts = $game->alivePlayersWithRole('analyst');
        $analyst = $analysts[0] ?? null;
        $analystAvailable = $analyst && !$game->analyst_used_ever;

        $aliveNpcs = array_map(fn ($n) => [
            'id' => $n['id'],
            'name' => $n['name'],
            'personality' => $n['personality'],
        ], $game->aliveNpcs());

        $killerNames = array_map(fn ($k) => $k['name'], $killers);

        // Check what actions have been submitted this round
        $actions = $game->nightActionsForRound($game->current_round);
        $actionTypes = array_column($actions, 'action_type');

        $killerDone = in_array('kill', $actionTypes) || in_array('threaten', $actionTypes);
        $guardianDone = !$guardian || in_array('protect', $actionTypes);
        // Analyst step done if already decided this round, or not available
        $analystDecided = !$analystAvailable || ($game->analyst_night_decided ?? false);

        // Determine current step
        if (!$killerDone) {
            $step = 'killer';
        } elseif (!$guardianDone) {
            $step = 'guardian';
        } elseif (!$analystDecided) {
            $step = 'analyst';
        } else {
            // All done — resolve and show summary
            $round = $this->nightService->resolve($game);

            $targetNpc = !empty($round['killer_target_npc_id']) ? $game->findNpc($round['killer_target_npc_id']) : null;
            $guardianNpc = !empty($round['guardian_target_npc_id']) ? $game->findNpc($round['guardian_target_npc_id']) : null;

            return Inertia::render('Night/MasterNightPanel', [
                'game' => $game->toArray(),
                'step' => 'summary',
                'roundResult' => [
                    'killer_action' => $round['killer_action'],
                    'target_name' => $targetNpc['name'] ?? null,
                    'kill_blocked' => $round['kill_blocked'] ?? false,
                    'guardian_target' => $guardianNpc['name'] ?? null,
                ],
                'round' => $game->current_round,
            ]);
        }

        return Inertia::render('Night/MasterNightPanel', [
            'game' => $game->toArray(),
            'step' => $step,
            'killerNames' => $killerNames,
            'hasGuardian' => $guardian !== null,
            'analystAvailable' => $analystAvailable,
            'analystName' => $analyst['name'] ?? null,
            'npcs' => array_values($aliveNpcs),
            'round' => $game->current_round,
        ]);
    }

    public function killerAction(Request $request, GameState $game)
    {
        $request->validate([
            'action' => 'required|in:kill,threaten',
            'target_npc_id' => 'required|integer',
        ]);

        // Group decision — use first alive killer as player_id
        $firstKiller = $game->aliveKillers()[0] ?? null;
        if (!$firstKiller) {
            return redirect()->route('game.night', $game);
        }

        $game->addNightAction([
            'round_number' => $game->current_round,
            'player_id' => $firstKiller['id'],
            'action_type' => $request->action,
            'target_npc_id' => (int) $request->target_npc_id,
        ]);

        return redirect()->route('game.night', $game);
    }

    public function guardianAction(Request $request, GameState $game)
    {
        $request->validate([
            'target_npc_id' => 'required|integer',
        ]);

        $guardian = $game->alivePlayersWithRole('guardian')[0] ?? null;
        if (!$guardian) {
            return redirect()->route('game.night', $game);
        }

        $game->addNightAction([
            'round_number' => $game->current_round,
            'player_id' => $guardian['id'],
            'action_type' => 'protect',
            'target_npc_id' => (int) $request->target_npc_id,
        ]);

        return redirect()->route('game.night', $game);
    }

    public function analystAction(Request $request, GameState $game)
    {
        $request->validate([
            'activate' => 'required|boolean',
        ]);

        if ($request->activate) {
            $game->update([
                'analyst_used' => true,
                'analyst_used_ever' => true,
            ]);
        }

        // Mark analyst as decided for this night so we don't ask again
        $game->update(['analyst_night_decided' => true]);

        return redirect()->route('game.night', $game);
    }
}
