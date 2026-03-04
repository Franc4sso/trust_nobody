<?php

namespace App\StateMachine;

use App\Enums\GamePhase;
use App\Enums\PlayerRole;
use App\GameState;
use App\Services\WinConditionService;

class GameStateMachine
{
    public function __construct(
        private WinConditionService $winService,
    ) {}

    public function advance(GameState $game): GamePhase
    {
        $next = match ($game->current_phase) {
            GamePhase::Setup => GamePhase::RoleReveal,
            GamePhase::RoleReveal => GamePhase::N1Intro,
            GamePhase::N1Intro => GamePhase::N1Vote,
            GamePhase::N1Vote => GamePhase::Night,
            GamePhase::Night => GamePhase::Morning,
            GamePhase::Morning => GamePhase::Day,
            GamePhase::Day => GamePhase::Vote,
            GamePhase::Vote => $this->afterVote($game),
            GamePhase::MediumReveal => $this->afterMediumReveal($game),
            GamePhase::GameOver => GamePhase::GameOver,
        };

        if ($next === GamePhase::Night) {
            $game->increment('current_round');
            $game->update(['analyst_night_decided' => false]);
        }

        $game->update(['current_phase' => $next->value]);

        return $next;
    }

    public function transitionTo(GameState $game, GamePhase $phase): void
    {
        $game->update(['current_phase' => $phase->value]);
    }

    public function startNight(GameState $game): void
    {
        $game->increment('current_round');
        $game->update(['current_phase' => GamePhase::Night->value]);
    }

    private function afterVote(GameState $game): GamePhase
    {
        $winner = $this->winService->check($game);
        if ($winner) {
            $game->update(['winner' => $winner]);
            return GamePhase::GameOver;
        }

        $round = $game->currentRound();
        if ($round && $round['eliminated_player_id']) {
            $medium = $game->alivePlayersWithRole(PlayerRole::Medium->value);
            if (!empty($medium)) {
                return GamePhase::MediumReveal;
            }
        }

        return GamePhase::Night;
    }

    private function afterMediumReveal(GameState $game): GamePhase
    {
        $winner = $this->winService->check($game);
        if ($winner) {
            $game->update(['winner' => $winner]);
            return GamePhase::GameOver;
        }

        return GamePhase::Night;
    }
}
