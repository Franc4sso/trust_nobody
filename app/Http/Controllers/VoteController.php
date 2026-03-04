<?php

namespace App\Http\Controllers;

use App\Enums\PlayerRole;
use App\GameState;
use App\Services\VoteService;
use App\Services\WinConditionService;
use App\StateMachine\GameStateMachine;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VoteController extends Controller
{
    public function __construct(
        private VoteService $voteService,
        private WinConditionService $winService,
        private GameStateMachine $stateMachine,
    ) {}

    public function n1Intro(GameState $game)
    {
        $players = $game->players();
        $playerNames = array_column($players, 'name', 'id');

        $npcs = array_map(fn ($n) => [
            'id' => $n['id'],
            'name' => $n['name'],
            'personality' => $n['personality'],
            'connection_descriptions' => array_map(
                fn ($cd) => $cd['text'],
                $n['connection_descriptions'] ?? []
            ),
        ], $game->npcs());

        return Inertia::render('N1/NpcIntroductions', [
            'game' => $game->toArray(),
            'npcs' => $npcs,
        ]);
    }

    public function n1Vote(GameState $game)
    {
        $alivePlayers = array_map(fn ($p) => ['id' => $p['id'], 'name' => $p['name']], $game->alivePlayers());

        // Check if all votes are already cast
        $votedPlayerIds = $game->voterIdsForRound(0, false);
        $allVoted = count($votedPlayerIds) >= count($alivePlayers);

        if ($allVoted) {
            $result = $this->tallyN1($game);
            return Inertia::render('Vote/VoteResult', [
                'game' => $game->toArray(),
                'result' => $result,
                'isN1' => true,
                'round' => 0,
            ]);
        }

        return Inertia::render('Vote/MasterVotePanel', [
            'game' => $game->toArray(),
            'voters' => array_values($alivePlayers),
            'targets' => array_values($alivePlayers),
            'isN1' => true,
            'isRunoff' => false,
            'round' => 0,
        ]);
    }

    public function n1CastAllVotes(Request $request, GameState $game)
    {
        $request->validate([
            'votes' => 'required|array',
            'votes.*.voter_id' => 'required|integer',
            'votes.*.target_id' => 'required|integer',
        ]);

        foreach ($request->votes as $vote) {
            $this->voteService->castVote($game, (int) $vote['voter_id'], (int) $vote['target_id']);
        }

        return redirect()->route('game.n1.vote', $game);
    }

    public function n1CastVote(Request $request, GameState $game)
    {
        $request->validate([
            'voter_id' => 'required|integer',
            'target_id' => 'required|integer',
        ]);

        $this->voteService->castVote($game, (int) $request->voter_id, (int) $request->target_id);

        return redirect()->route('game.n1.vote', $game);
    }

    public function show(GameState $game)
    {
        $alivePlayers = array_map(fn ($p) => ['id' => $p['id'], 'name' => $p['name']], $game->alivePlayers());

        $isRunoff = $game->runoff_active;
        $runoffPlayerIds = $game->runoff_player_ids ?? [];

        $votedPlayerIds = $game->voterIdsForRound($game->current_round, $isRunoff);
        $allVoted = count($votedPlayerIds) >= count($alivePlayers);

        if ($allVoted) {
            $result = $this->voteService->tally($game, $isRunoff);

            if ($result['runoff']) {
                $game->update([
                    'runoff_active' => true,
                    'runoff_player_ids' => array_column($result['runoff'], 'id'),
                ]);

                return Inertia::render('Vote/VoteResult', [
                    'game' => $game->toArray(),
                    'result' => [
                        'counts' => $result['counts'],
                        'runoff_players' => array_map(fn ($p) => ['id' => $p['id'], 'name' => $p['name']], $result['runoff']),
                    ],
                    'isRunoff' => false,
                    'needsRunoff' => true,
                    'round' => $game->current_round,
                ]);
            }

            // Clear runoff state
            $game->update([
                'runoff_active' => false,
                'runoff_player_ids' => [],
            ]);

            $eliminated = $result['eliminated'];

            return Inertia::render('Vote/VoteResult', [
                'game' => $game->toArray(),
                'result' => [
                    'counts' => $result['counts'],
                    'eliminated' => $eliminated ? [
                        'id' => $eliminated['id'],
                        'name' => $eliminated['name'],
                        'role' => $eliminated['role'],
                    ] : null,
                ],
                'isRunoff' => $isRunoff,
                'needsRunoff' => false,
                'round' => $game->current_round,
            ]);
        }

        if ($isRunoff) {
            $targets = array_values(array_filter($alivePlayers, fn ($p) => in_array($p['id'], $runoffPlayerIds)));
        } else {
            $targets = array_values($alivePlayers);
        }

        return Inertia::render('Vote/MasterVotePanel', [
            'game' => $game->toArray(),
            'voters' => array_values($alivePlayers),
            'targets' => $targets,
            'isN1' => false,
            'isRunoff' => $isRunoff,
            'round' => $game->current_round,
        ]);
    }

    public function castAllVotes(Request $request, GameState $game)
    {
        $request->validate([
            'votes' => 'required|array',
            'votes.*.voter_id' => 'required|integer',
            'votes.*.target_id' => 'required|integer',
        ]);

        $isRunoff = $game->runoff_active;
        foreach ($request->votes as $vote) {
            $this->voteService->castVote($game, (int) $vote['voter_id'], (int) $vote['target_id'], $isRunoff);
        }

        return redirect()->route('game.vote', $game);
    }

    public function castVote(Request $request, GameState $game)
    {
        $request->validate([
            'voter_id' => 'required|integer',
            'target_id' => 'required|integer',
        ]);

        $isRunoff = $game->runoff_active;
        $this->voteService->castVote($game, (int) $request->voter_id, (int) $request->target_id, $isRunoff);

        return redirect()->route('game.vote', $game);
    }

    public function mediumReveal(GameState $game)
    {
        $round = $game->currentRound();
        $eliminatedId = $round['eliminated_player_id'] ?? null;
        $eliminated = $eliminatedId ? $game->findPlayer($eliminatedId) : null;

        $mediums = $game->alivePlayersWithRole(PlayerRole::Medium->value);
        $medium = $mediums[0] ?? null;

        return Inertia::render('Vote/MediumReveal', [
            'game' => $game->toArray(),
            'medium' => $medium ? ['id' => $medium['id'], 'name' => $medium['name']] : null,
            'eliminated' => $eliminated ? [
                'name' => $eliminated['name'],
                'was_killer' => $eliminated['role'] === PlayerRole::SerialKiller->value,
            ] : null,
            'round' => $game->current_round,
        ]);
    }

    private function tallyN1(GameState $game): array
    {
        $votes = $game->votesForRound(0, false);

        $counts = [];
        foreach ($votes as $v) {
            $tid = $v['target_player_id'];
            $counts[$tid] = ($counts[$tid] ?? 0) + 1;
        }
        arsort($counts);

        $playerNames = [];
        foreach ($game->players() as $p) {
            $playerNames[$p['id']] = $p['name'];
        }

        $namedCounts = [];
        foreach ($counts as $playerId => $count) {
            $namedCounts[] = [
                'player_id' => $playerId,
                'name' => $playerNames[$playerId] ?? 'Unknown',
                'votes' => $count,
            ];
        }

        return ['counts' => $namedCounts];
    }
}
