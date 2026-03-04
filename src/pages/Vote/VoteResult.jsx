import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGame, selectors } from '@/engine/gameState';
import { tally } from '@/engine/vote';
import { checkWinCondition } from '@/engine/winCondition';
import { advance } from '@/engine/stateMachine';
import { getRouteForPhase } from '@/engine/phaseRoutes';

export default function VoteResult() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { state, dispatch, ACTIONS } = useGame();

    const isRunoff = searchParams.get('runoff') === '1';
    const result = tally(state, isRunoff);

    useEffect(() => {
        // Auto-process if this is a vote result (not runoff decision)
        if (result.eliminated && !isRunoff) {
            setTimeout(() => {
                // Update player as not alive
                dispatch({
                    type: ACTIONS.UPDATE_PLAYER,
                    payload: {
                        id: result.eliminated.id,
                        updates: { is_alive: false },
                    },
                });

                // Check win condition
                const newState = {
                    ...state,
                    players: state.players.map(p =>
                        p.id === result.eliminated.id ? { ...p, is_alive: false } : p
                    ),
                };

                const winner = checkWinCondition(newState);
                if (winner) {
                    dispatch({
                        type: ACTIONS.SET_WINNER,
                        payload: winner,
                    });
                    navigate('/game-over');
                    return;
                }

                // Check for medium reveal
                const hasMedium = newState.players.some(p => p.is_alive && p.role === 'medium');

                if (hasMedium) {
                    navigate('/vote/medium-reveal');
                } else {
                    // Advance to night
                    const { next, updates } = advance(newState, checkWinCondition);
                    dispatch({
                        type: ACTIONS.SET_PHASE_AND_ROUND,
                        payload: { phase: next, ...updates },
                    });
                    navigate(getRouteForPhase(next));
                }
            }, 2000);
        }
    }, [result.eliminated, isRunoff]);

    const proceedToRunoff = () => {
        if (result.runoff) {
            navigate('/vote/panel?runoff=1');
        }
    };

    const proceedAfterVote = () => {
        if (result.eliminated) {
            // Already handled by useEffect
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {result.runoff && !isRunoff && (
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 space-y-6">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-amber-400">Ballottaggio!</h1>
                            <p className="text-slate-400 mt-2">
                                È stata un'elezione serrata. Ballottaggio tra:
                            </p>
                        </div>

                        <div className="space-y-3">
                            {result.runoff.map((player) => (
                                <div key={player.id} className="bg-slate-700 rounded-lg p-4 text-center">
                                    <p className="font-bold text-lg">{player.name}</p>
                                    <p className="text-sm text-slate-400">
                                        {result.counts[player.id]} voti
                                    </p>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={proceedToRunoff}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-black font-bold py-3 px-6 rounded-lg transition"
                        >
                            Procedi al Ballottaggio
                        </button>
                    </div>
                )}

                {result.eliminated && (
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 space-y-6">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-red-400">Eliminato!</h1>
                        </div>

                        <div className="bg-red-900 border border-red-700 rounded-lg p-6 text-center">
                            <p className="text-2xl font-bold text-red-400">{result.eliminated.name}</p>
                            <p className="text-sm text-red-300 mt-2">
                                {result.counts[result.eliminated.id]} voti
                            </p>
                        </div>

                        <div className="text-center text-slate-400">
                            <p className="text-sm">Il gioco continua...</p>
                        </div>
                    </div>
                )}

                {!result.runoff && !result.eliminated && (
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
                        <h1 className="text-2xl font-bold text-amber-400 mb-4">Conteggio Voti</h1>
                        <p className="text-slate-400">
                            Nessun voto ricevuto o errore nel conteggio.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
