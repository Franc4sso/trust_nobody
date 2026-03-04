import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, selectors } from '@/engine/gameState';
import { advance } from '@/engine/stateMachine';
import { checkWinCondition } from '@/engine/winCondition';
import { getRouteForPhase } from '@/engine/phaseRoutes';

export default function MediumReveal() {
    const navigate = useNavigate();
    const { state, dispatch, ACTIONS } = useGame();

    const currentRound = selectors.currentRound(state);
    const eliminatedPlayer = currentRound?.eliminated_player_id
        ? selectors.findPlayer(state, currentRound.eliminated_player_id)
        : null;

    const continueToNight = () => {
        // Advance phase
        const { next, updates } = advance(state, checkWinCondition);

        dispatch({
            type: ACTIONS.SET_PHASE_AND_ROUND,
            payload: { phase: next, ...updates },
        });

        navigate(getRouteForPhase(next));
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-purple-400">Medium Reveal</h1>
                    <p className="text-slate-400 mt-2">
                        Il medium ha investigato l'ultimo eliminato...
                    </p>
                </div>

                {eliminatedPlayer && (
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 space-y-6">
                        <div className="bg-slate-900 rounded-lg p-4 border-2 border-purple-500 text-center">
                            <h2 className="text-2xl font-bold text-white">{eliminatedPlayer.name}</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-slate-400 text-sm mb-2">ERA UN...</p>
                                <p className="text-3xl font-bold text-purple-300">
                                    {eliminatedPlayer.role_label}
                                </p>
                            </div>

                            <div>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    {eliminatedPlayer.role === 'serial_killer' ? (
                                        <span className="text-red-400">
                                            ⚠️ ERA IL KILLER!
                                        </span>
                                    ) : (
                                        <span className="text-green-400">
                                            ✓ Era innocente.
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={continueToNight}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-black font-bold py-3 px-6 rounded-lg transition"
                        >
                            Continua alla Notte Successiva
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
