import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, selectors } from '@/engine/gameState';
import { resolveNight } from '@/engine/nightResolution';
import { checkWinCondition } from '@/engine/winCondition';
import { advance } from '@/engine/stateMachine';
import { getRouteForPhase } from '@/engine/phaseRoutes';

export default function MasterNightPanel() {
    const navigate = useNavigate();
    const { state, dispatch, ACTIONS } = useGame();

    const [step, setStep] = useState('killer'); // 'killer', 'guardian', 'analyst', 'summary'
    const [nightly_actions, setNightlyActions] = useState([]);

    const killers = selectors.aliveKillers(state);
    const guardians = state.players.filter(p => p.is_alive && p.role === 'guardian');
    const analysts = state.players.filter(p => p.is_alive && p.role === 'analyst' && !state.analyst_used);
    const alivePlayers = selectors.alivePlayers(state);
    const aliveNpcs = selectors.aliveNpcs(state);

    // if we somehow end up on the analyst step but there is no analyst available,
    // immediately advance to summary to avoid a blank screen.
    useEffect(() => {
        if (step === 'analyst' && analysts.length === 0) {
            setStep('summary');
        }
    }, [step, analysts.length]);

    const addAction = (action) => {
        setNightlyActions([...nightly_actions, action]);
        if (step === 'killer' && guardians.length > 0) {
            // after killer action move to guardian if present
            setStep('guardian');
        } else if (step === 'guardian') {
            // after guardian action, only go to analyst if there is one still available
            if (analysts.length > 0) {
                setStep('analyst');
            } else {
                setStep('summary');
            }
        } else if (step === 'analyst' && analysts.length > 0) {
            setStep('summary');
        } else {
            setStep('summary');
        }
    };

    const skipPhase = () => {
        if (step === 'killer' && guardians.length > 0) {
            setStep('guardian');
        } else if (step === 'guardian' && analysts.length > 0) {
            setStep('analyst');
        } else {
            setStep('summary');
        }
    };

    const resolveAndContinue = () => {
        // Resolve night with accumulated actions
        const { roundUpdate, npcUpdates } = resolveNight(state, nightly_actions);

        // Dispatch RESOLVE_NIGHT
        dispatch({
            type: ACTIONS.RESOLVE_NIGHT,
            payload: { roundUpdate, npcUpdates },
        });

        // Check win condition
        const newState = {
            ...state,
            npcs: state.npcs.map(n =>
                npcUpdates[n.id] ? { ...n, ...npcUpdates[n.id] } : n
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

        // Advance phase
        const { next, updates } = advance(newState, checkWinCondition);

        // Update state with new phase
        dispatch({
            type: ACTIONS.SET_PHASE_AND_ROUND,
            payload: { phase: next, ...updates },
        });

        // Navigate to new phase
        navigate(getRouteForPhase(next));
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <div className="p-6 max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-amber-400 mb-2">Notte {state.current_round}</h1>
                <p className="text-slate-400 mb-6">Fase: {step}</p>

                {state.npcs.filter(n => !n.is_alive).length > 0 && (
                    <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
                        <p className="text-red-200 font-semibold">NPC già morti:</p>
                        <ul className="list-disc list-inside text-red-300">
                            {state.npcs.filter(n => !n.is_alive).map(n => (
                                <li key={n.id}>{n.name}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {step === 'killer' && killers.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">Azione Serial Killer</h2>
                        <p className="text-slate-400">Scegli un NPC e un'azione</p>

                        <div className="grid grid-cols-1 gap-4">
                            {aliveNpcs.map((npc) => (
                                <div key={npc.id} className="border border-slate-700 rounded-lg p-4 space-y-2 bg-slate-800/50">
                                    <p className="font-bold text-red-300">{npc.name}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() =>
                                                addAction({
                                                    action_type: 'kill',
                                                    actor_player_id: killers[0].id,
                                                    target_npc_id: npc.id,
                                                    round_number: state.current_round,
                                                })
                                            }
                                            className="p-3 bg-red-900 hover:bg-red-800 rounded text-sm font-bold"
                                        >
                                            ☠️ Uccidi
                                        </button>
                                        <button
                                            onClick={() =>
                                                addAction({
                                                    action_type: 'threaten',
                                                    actor_player_id: killers[0].id,
                                                    target_npc_id: npc.id,
                                                    round_number: state.current_round,
                                                })
                                            }
                                            className="p-3 bg-orange-900 hover:bg-orange-800 rounded text-sm font-bold"
                                        >
                                            ⚠️ Minaccia
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={skipPhase}
                            className="w-full bg-slate-700 hover:bg-slate-600 py-2 rounded-lg"
                        >
                            Salta
                        </button>
                    </div>
                )}

                {step === 'guardian' && guardians.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">Azione Guardiano</h2>
                        <p className="text-slate-400">Scegli un NPC da proteggere</p>

                        <div className="grid grid-cols-2 gap-4">
                            {aliveNpcs.map((npc) => (
                                <button
                                    key={npc.id}
                                    onClick={() =>
                                        addAction({
                                            action_type: 'protect',
                                            actor_player_id: guardians[0].id,
                                            target_npc_id: npc.id,
                                            round_number: state.current_round,
                                        })
                                    }
                                    className="p-4 bg-blue-900 hover:bg-blue-800 rounded-lg text-center"
                                >
                                    <p className="font-bold">{npc.name}</p>
                                    <p className="text-xs text-blue-200">Proteggi</p>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={skipPhase}
                            className="w-full bg-slate-700 hover:bg-slate-600 py-2 rounded-lg"
                        >
                            Salta
                        </button>
                    </div>
                )}

                {step === 'analyst' && analysts.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">Azione Analista</h2>
                        <p className="text-slate-400">Attiva il tuo potere?</p>

                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    addAction({
                                        action_type: 'analyst',
                                        actor_player_id: analysts[0].id,
                                        round_number: state.current_round,
                                    });
                                    // Mark analyst as used
                                    dispatch({
                                        type: ACTIONS.UPDATE_PLAYER,
                                        payload: {
                                            id: analysts[0].id,
                                            updates: { analyst_used: true, analyst_used_ever: true },
                                        },
                                    });
                                }}
                                className="flex-1 bg-purple-900 hover:bg-purple-800 py-3 rounded-lg font-bold"
                            >
                                Attiva Potere
                            </button>
                            <button
                                onClick={skipPhase}
                                className="flex-1 bg-slate-700 hover:bg-slate-600 py-3 rounded-lg"
                            >
                                Non Attivare
                            </button>
                        </div>
                    </div>
                )}

                {step === 'summary' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">Riepilogo Azioni Notturne</h2>

                        <div className="bg-slate-800 p-4 rounded-lg space-y-2 max-h-64 overflow-y-auto">
                            {nightly_actions.length === 0 ? (
                                <p className="text-slate-400">Nessuna azione</p>
                            ) : (
                                nightly_actions.map((action, i) => (
                                    <p key={i} className="text-sm text-slate-300">
                                        • {action.action_type}
                                    </p>
                                ))
                            )}
                        </div>

                        <button
                            onClick={resolveAndContinue}
                            className="w-full bg-amber-600 hover:bg-amber-700 font-bold py-3 rounded-lg"
                        >
                            Continua al Mattino
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
