<?php

namespace App\Services;

use App\GameState;

class VoteService
{
    public function castVote(GameState $game, int $voterId, int $targetId, bool $isRunoff = false): void
    {
        $game->addVote([
            'round_number' => $game->current_round,
            'voter_player_id' => $voterId,
            'target_player_id' => $targetId,
            'is_runoff' => $isRunoff,
        ]);
    }

    /**
     * Tally votes and return result.
     * Returns: ['eliminated' => array|null, 'runoff' => array[]|null, 'counts' => array]
     */
    public function tally(GameState $game, bool $isRunoff = false): array
    {
        $votes = $game->votesForRound($game->current_round, $isRunoff);

        $counts = [];
        foreach ($votes as $v) {
            $tid = $v['target_player_id'];
            $counts[$tid] = ($counts[$tid] ?? 0) + 1;
        }
        arsort($counts);

        if (empty($counts)) {
            return ['eliminated' => null, 'runoff' => null, 'counts' => []];
        }

        $maxVotes = reset($counts);
        $topPlayerIds = array_keys(array_filter($counts, fn ($c) => $c === $maxVotes));

        // If tie and not already a runoff, trigger runoff
        if (count($topPlayerIds) > 1 && !$isRunoff) {
            $runoffPlayers = array_map(fn ($id) => $game->findPlayer($id), $topPlayerIds);
            return [
                'eliminated' => null,
                'runoff' => $runoffPlayers,
                'counts' => $counts,
            ];
        }

        // Eliminate the player with most votes (in runoff tie, pick randomly)
        $eliminatedId = count($topPlayerIds) > 1
            ? $topPlayerIds[array_rand($topPlayerIds)]
            : $topPlayerIds[0];

        $game->updatePlayer($eliminatedId, ['is_alive' => false]);
        $eliminated = $game->findPlayer($eliminatedId);

        // Record in game round
        $round = $game->currentRound();
        if ($round) {
            $game->updateRound($round['id'], ['eliminated_player_id' => $eliminatedId]);
        }

        return [
            'eliminated' => $eliminated,
            'runoff' => null,
            'counts' => $counts,
        ];
    }

    public function allVotesCast(GameState $game, bool $isRunoff = false, ?array $eligibleVoterIds = null): bool
    {
        $voters = $eligibleVoterIds ?? array_column($game->alivePlayers(), 'id');
        $voteCount = count($game->votesForRound($game->current_round, $isRunoff));

        return $voteCount >= count($voters);
    }
}
