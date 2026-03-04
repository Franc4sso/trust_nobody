<?php

namespace App\Http\Controllers;

use App\Enums\GamePhase;
use App\GameState;
use App\Services\DynamicHintService;
use App\StateMachine\GameStateMachine;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GameController extends Controller
{
    public function __construct(
        private GameStateMachine $stateMachine,
        private DynamicHintService $hintService,
    ) {}

    public function home()
    {
        return Inertia::render('Home');
    }

    public function show(GameState $game)
    {
        return match ($game->current_phase) {
            GamePhase::Setup => redirect()->route('game.setup.names', $game),
            GamePhase::RoleReveal => redirect()->route('game.setup.roles', $game),
            GamePhase::N1Intro => redirect()->route('game.n1.intro', $game),
            GamePhase::N1Vote => redirect()->route('game.n1.vote', $game),
            GamePhase::Night => redirect()->route('game.night', $game),
            GamePhase::Morning => redirect()->route('game.morning', $game),
            GamePhase::Day => redirect()->route('game.day', $game),
            GamePhase::Vote => redirect()->route('game.vote', $game),
            GamePhase::MediumReveal => redirect()->route('game.medium', $game),
            GamePhase::GameOver => redirect()->route('game.over', $game),
        };
    }

    public function morning(GameState $game)
    {
        $round = $game->currentRound();
        $hintNpcId = $round['hint_npc_id'] ?? null;
        $hintNpc = $hintNpcId ? $game->findNpc($hintNpcId) : null;

        $hints = [];
        if ($hintNpc) {
            $hintText = $this->hintService->generateHint($game, $hintNpc, $hintNpc['is_threatened']);
            $hints[] = [
                'npc_name' => $hintNpc['name'],
                'npc_personality' => $hintNpc['personality'],
                'text' => $hintText,
                'is_threatened' => $hintNpc['is_threatened'],
            ];

            if ($game->analyst_used) {
                $bonusText = $this->hintService->generateAnalystBonus($game, $hintNpc);
                $hints[] = [
                    'npc_name' => $hintNpc['name'],
                    'npc_personality' => $hintNpc['personality'],
                    'text' => $bonusText,
                    'is_threatened' => false,
                    'is_analyst_bonus' => true,
                ];

                $game->update(['analyst_used' => false]);
            }
        }

        $nightSummary = null;
        if ($round) {
            $targetNpc = !empty($round['killer_target_npc_id']) ? $game->findNpc($round['killer_target_npc_id']) : null;

            $nightSummary = [
                'action' => $round['killer_action'],
                'target_name' => $targetNpc['name'] ?? null,
                'blocked' => $round['kill_blocked'] ?? false,
            ];
        }

        $aliveNpcs = array_map(fn ($n) => [
            'id' => $n['id'],
            'name' => $n['name'],
            'personality' => $n['personality'],
            'is_threatened' => $n['is_threatened'],
        ], $game->aliveNpcs());

        return Inertia::render('Morning/NpcHint', [
            'game' => $game->toArray(),
            'hints' => $hints,
            'nightSummary' => $nightSummary,
            'aliveNpcs' => array_values($aliveNpcs),
            'round' => $game->current_round,
        ]);
    }

    public function day(GameState $game)
    {
        $alivePlayers = array_map(fn ($p) => ['id' => $p['id'], 'name' => $p['name']], $game->alivePlayers());
        $aliveNpcs = array_map(fn ($n) => ['id' => $n['id'], 'name' => $n['name'], 'personality' => $n['personality']], $game->aliveNpcs());

        return Inertia::render('Day/Discussion', [
            'game' => $game->toArray(),
            'players' => array_values($alivePlayers),
            'aliveNpcs' => array_values($aliveNpcs),
            'round' => $game->current_round,
        ]);
    }

    public function advance(GameState $game)
    {
        $this->stateMachine->advance($game);
        return redirect()->route('game.show', $game);
    }

    public function activateAnalyst(GameState $game)
    {
        $game->update(['analyst_used' => true]);
        return redirect()->route('game.show', $game);
    }

    public function gameOver(GameState $game)
    {
        $players = array_map(fn ($p) => [
            'id' => $p['id'],
            'name' => $p['name'],
            'role' => $p['role'],
            'is_alive' => $p['is_alive'],
        ], $game->players());

        $npcs = array_map(fn ($n) => [
            'id' => $n['id'],
            'name' => $n['name'],
            'personality' => $n['personality'],
            'is_alive' => $n['is_alive'],
        ], $game->npcs());

        return Inertia::render('GameOver', [
            'game' => $game->toArray(),
            'winner' => $game->winner,
            'players' => $players,
            'npcs' => $npcs,
        ]);
    }
}
