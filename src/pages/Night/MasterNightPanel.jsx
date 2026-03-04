import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, selectors } from '@/engine/gameState';
import { resolveNight } from '@/engine/nightResolution';
import { checkWinCondition } from '@/engine/winCondition';
import { advance } from '@/engine/stateMachine';
import { getRouteForPhase } from '@/engine/phaseRoutes';
import PageShell from '@/components/PageShell';
import Headline from '@/components/Headline';
import PulpCard from '@/components/PulpCard';
import NeonButton from '@/components/NeonButton';

export default function MasterNightPanel() {
    const navigate = useNavigate();
    const { state, dispatch, ACTIONS } = useGame();

    const [step, setStep] = useState('killer');
    const [nightly_actions, setNightlyActions] = useState([]);

    const killers = selectors.aliveKillers(state);
    const guardians = state.players.filter(p => p.is_alive && p.role === 'guardian');
    const analysts = state.players.filter(p => p.is_alive && p.role === 'analyst' && !p.analyst_used);
    const alivePlayers = selectors.alivePlayers(state);
    const aliveNpcs = selectors.aliveNpcs(state);

    useEffect(() => {
        if (step === 'analyst' && analysts.length === 0) {
            setStep('summary');
        }
    }, [step, analysts.length]);

    const addAction = (action) => {
        setNightlyActions([...nightly_actions, action]);
        if (step === 'killer' && guardians.length > 0) {
            setStep('guardian');
        } else if (step === 'guardian') {
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
        const { roundUpdate, npcUpdates } = resolveNight(state, nightly_actions);

        dispatch({
            type: ACTIONS.RESOLVE_NIGHT,
            payload: { roundUpdate, npcUpdates },
        });

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

        const { next, updates } = advance(newState, checkWinCondition);

        dispatch({
            type: ACTIONS.SET_PHASE_AND_ROUND,
            payload: { phase: next, ...updates },
        });

        navigate(getRouteForPhase(next));
    };

    const stepLabels = {
        killer: { title: 'AZIONE KILLER', color: 'red' },
        guardian: { title: 'AZIONE GUARDIANO', color: 'green' },
        analyst: { title: 'AZIONE ANALISTA', color: 'blue' },
        summary: { title: 'RAPPORTO NOTTURNO', color: 'yellow' },
    };

    const current = stepLabels[step];

    return (
        <PageShell vignette>
            <div className="p-6 max-w-2xl mx-auto relative z-10">
                <Headline glow="red" subtitle={`Fase: ${step}`}>
                    NOTTE {state.current_round}
                </Headline>

                {/* Dead NPCs warning */}
                {state.npcs.filter(n => !n.is_alive).length > 0 && (
                    <PulpCard variant="danger" className="mb-6 p-4">
                        <p className="text-headline text-sm text-blood tracking-widest mb-2">NPC GIA' ELIMINATI:</p>
                        <div className="space-y-1">
                            {state.npcs.filter(n => !n.is_alive).map(n => (
                                <p key={n.id} className="text-ui text-cream/50 text-sm line-through">{n.name}</p>
                            ))}
                        </div>
                    </PulpCard>
                )}

                {/* Killer Step */}
                {step === 'killer' && killers.length > 0 && (
                    <div className="space-y-4 animate-fade-in-up">
                        <h2 className="text-headline text-2xl text-blood glow-red">{current.title}</h2>
                        <p className="text-cream/50 text-sm">Scegli un NPC e un'azione</p>

                        <div className="space-y-3">
                            {aliveNpcs.map((npc) => (
                                <PulpCard key={npc.id} variant="danger" className="p-4 space-y-3">
                                    <p className="text-headline text-lg text-blood">{npc.name}</p>
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
                                            className="btn-blood py-2 text-sm"
                                        >
                                            Uccidi
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
                                            className="btn-neon btn-neon-yellow py-2 text-sm"
                                        >
                                            Minaccia
                                        </button>
                                    </div>
                                </PulpCard>
                            ))}
                        </div>

                        <button onClick={skipPhase} className="w-full text-ui text-cream/40 text-sm py-2 hover:text-cream/60 transition">
                            Salta
                        </button>
                    </div>
                )}

                {/* Guardian Step */}
                {step === 'guardian' && guardians.length > 0 && (
                    <div className="space-y-4 animate-fade-in-up">
                        <h2 className="text-headline text-2xl text-poison glow-green">{current.title}</h2>
                        <p className="text-cream/50 text-sm">Scegli un NPC da proteggere</p>

                        <div className="grid grid-cols-2 gap-3">
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
                                    className="card-pulp p-4 text-center hover:border-poison transition-all"
                                    style={{ borderColor: 'var(--color-poison)' }}
                                >
                                    <p className="text-headline text-lg text-poison">{npc.name}</p>
                                    <p className="text-ui text-xs text-cream/40 mt-1">Proteggi</p>
                                </button>
                            ))}
                        </div>

                        <button onClick={skipPhase} className="w-full text-ui text-cream/40 text-sm py-2 hover:text-cream/60 transition">
                            Salta
                        </button>
                    </div>
                )}

                {/* Analyst Step */}
                {step === 'analyst' && analysts.length > 0 && (
                    <div className="space-y-4 animate-fade-in-up">
                        <h2 className="text-headline text-2xl text-neon-blue glow-blue">{current.title}</h2>
                        <p className="text-cream/50 text-sm">Attiva il tuo potere?</p>

                        <div className="flex gap-3">
                            <NeonButton
                                color="blue"
                                className="flex-1"
                                onClick={() => {
                                    addAction({
                                        action_type: 'analyst',
                                        actor_player_id: analysts[0].id,
                                        round_number: state.current_round,
                                    });
                                    dispatch({
                                        type: ACTIONS.UPDATE_PLAYER,
                                        payload: {
                                            id: analysts[0].id,
                                            updates: { analyst_used: true, analyst_used_ever: true },
                                        },
                                    });
                                }}
                            >
                                Attiva Potere
                            </NeonButton>
                            <button
                                onClick={skipPhase}
                                className="flex-1 btn-neon btn-neon-yellow py-3 text-sm"
                            >
                                Non Attivare
                            </button>
                        </div>
                    </div>
                )}

                {/* Summary */}
                {step === 'summary' && (
                    <div className="space-y-4 animate-fade-in-up">
                        <h2 className="text-headline text-2xl text-taxi glow-yellow">{current.title}</h2>

                        <PulpCard variant="vintage" className="p-5 space-y-2 max-h-64 overflow-y-auto">
                            {nightly_actions.length === 0 ? (
                                <p className="text-cream/40 text-sm">Nessuna azione registrata</p>
                            ) : (
                                nightly_actions.map((action, i) => (
                                    <p key={i} className="text-ui text-sm text-cream/70">
                                        &bull; {action.action_type}
                                    </p>
                                ))
                            )}
                        </PulpCard>

                        <NeonButton color="yellow" onClick={resolveAndContinue}>
                            Continua al Mattino
                        </NeonButton>
                    </div>
                )}
            </div>
        </PageShell>
    );
}
