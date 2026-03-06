import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame, selectors } from '@/engine/gameState';
import { resolveNight } from '@/engine/nightResolution';
import { checkWinCondition } from '@/engine/winCondition';
import { advance } from '@/engine/stateMachine';
import { getRouteForPhase } from '@/engine/phaseRoutes';
import { Skull, Shield, Scan, Brain, FileText } from 'lucide-react';
import PageShell from '@/components/PageShell';
import Headline from '@/components/Headline';
import PulpCard from '@/components/PulpCard';
import NeonButton from '@/components/NeonButton';

const stepConfig = {
    killer: { title: 'AZIONE KILLER', icon: Skull, color: '#d4364b', textColor: 'text-blood', glow: 'glow-red' },
    guardian: { title: 'AZIONE GUARDIANO', icon: Shield, color: '#3ecf8e', textColor: 'text-poison', glow: 'glow-green' },
    analyst: { title: 'AZIONE ANALISTA', icon: Scan, color: '#60a5fa', textColor: 'text-neon-blue', glow: 'glow-blue' },
    seer: { title: 'AZIONE VEGGENTE', icon: Brain, color: '#a78bfa', textColor: 'text-morphine', glow: 'glow-purple' },
    summary: { title: 'RAPPORTO NOTTURNO', icon: FileText, color: '#d4a843', textColor: 'text-taxi', glow: 'glow-yellow' },
};

export default function MasterNightPanel() {
    const navigate = useNavigate();
    const { state, dispatch, ACTIONS } = useGame();

    const [step, setStep] = useState('killer');
    const [nightly_actions, setNightlyActions] = useState([]);

    const killers = selectors.aliveKillers(state);
    const guardians = state.players.filter(p => p.is_alive && p.role === 'guardian');
    const analysts = state.players.filter(p => p.is_alive && p.role === 'analyst' && !p.analyst_used);
    const seers = state.players.filter(p => p.is_alive && p.role === 'seer' && !p.seer_used);
    const [seerResult, setSeerResult] = useState(null);
    const alivePlayers = selectors.alivePlayers(state);
    const aliveNpcs = selectors.aliveNpcs(state);

    const lastRound = state.rounds?.find(r => r.round_number === state.current_round - 1);
    const lastThreatenedNpcId = lastRound?.killer_action === 'threaten' ? lastRound.killer_target_npc_id : null;

    const nextAfterAnalyst = seers.length > 0 ? 'seer' : 'summary';

    useEffect(() => {
        if (step === 'analyst' && analysts.length === 0) {
            setStep(nextAfterAnalyst);
        }
        if (step === 'seer' && seers.length === 0) {
            setStep('summary');
        }
    }, [step, analysts.length, seers.length]);

    const addAction = (action) => {
        setNightlyActions([...nightly_actions, action]);
        if (step === 'killer' && guardians.length > 0) {
            setStep('guardian');
        } else if (step === 'killer') {
            if (analysts.length > 0) setStep('analyst');
            else if (seers.length > 0) setStep('seer');
            else setStep('summary');
        } else if (step === 'guardian') {
            if (analysts.length > 0) setStep('analyst');
            else if (seers.length > 0) setStep('seer');
            else setStep('summary');
        } else if (step === 'analyst') {
            if (seers.length > 0) setStep('seer');
            else setStep('summary');
        } else if (step === 'seer') {
            setStep('summary');
        } else {
            setStep('summary');
        }
    };

    const skipPhase = () => {
        if (step === 'killer' && guardians.length > 0) {
            setStep('guardian');
        } else if (step === 'killer' && analysts.length > 0) {
            setStep('analyst');
        } else if (step === 'killer' && seers.length > 0) {
            setStep('seer');
        } else if (step === 'guardian' && analysts.length > 0) {
            setStep('analyst');
        } else if (step === 'guardian' && seers.length > 0) {
            setStep('seer');
        } else if (step === 'analyst' && seers.length > 0) {
            setStep('seer');
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

    const current = stepConfig[step];
    const StepIcon = current.icon;

    return (
        <PageShell vignette phase="night">
            <div className="p-6 max-w-2xl mx-auto relative z-10">
                <Headline glow="red" subtitle={`Fase: ${step}`}>
                    NOTTE {state.current_round}
                </Headline>

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${current.color}15` }}>
                        <StepIcon size={22} color={current.color} strokeWidth={1.5} />
                    </div>
                    <h2 className={`text-headline text-xl ${current.textColor} ${current.glow}`}>{current.title}</h2>
                </div>

                {/* Dead NPCs warning */}
                {state.npcs.filter(n => !n.is_alive).length > 0 && (
                    <PulpCard variant="danger" className="mb-6 p-4">
                        <p className="text-headline text-xs text-blood tracking-widest mb-2">NPC ELIMINATI</p>
                        <div className="space-y-1">
                            {state.npcs.filter(n => !n.is_alive).map(n => (
                                <p key={n.id} className="text-ui text-cream/40 text-sm line-through">{n.name}</p>
                            ))}
                        </div>
                    </PulpCard>
                )}

                <AnimatePresence mode="wait">
                    {/* Killer Step */}
                    {step === 'killer' && killers.length > 0 && (
                        <motion.div
                            key="killer"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="space-y-4"
                        >
                            <p className="text-cream/50 text-sm">Scegli un NPC e un'azione</p>
                            <div className="space-y-3">
                                {aliveNpcs.map((npc, i) => (
                                    <motion.div
                                        key={npc.id}
                                        initial={{ opacity: 0, x: -12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                    >
                                        <PulpCard variant="danger" className="p-4 space-y-3">
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
                                                    disabled={npc.id === lastThreatenedNpcId}
                                                    className={`btn-neon btn-neon-yellow py-2 text-sm ${npc.id === lastThreatenedNpcId ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                >
                                                    Minaccia
                                                </button>
                                            </div>
                                        </PulpCard>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Guardian Step */}
                    {step === 'guardian' && guardians.length > 0 && (
                        <motion.div
                            key="guardian"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="space-y-4"
                        >
                            <p className="text-cream/50 text-sm">Scegli un NPC da proteggere</p>
                            <div className="grid grid-cols-2 gap-3">
                                {aliveNpcs.map((npc, i) => (
                                    <motion.button
                                        key={npc.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.06 }}
                                        onClick={() =>
                                            addAction({
                                                action_type: 'protect',
                                                actor_player_id: guardians[0].id,
                                                target_npc_id: npc.id,
                                                round_number: state.current_round,
                                            })
                                        }
                                        className="card-pulp p-4 text-center hover:border-poison/50 transition-all"
                                        style={{ borderColor: 'rgba(62, 207, 142, 0.3)' }}
                                    >
                                        <p className="text-headline text-lg text-poison">{npc.name}</p>
                                        <p className="text-ui text-xs text-cream/40 mt-1">Proteggi</p>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Analyst Step */}
                    {step === 'analyst' && analysts.length > 0 && (
                        <motion.div
                            key="analyst"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="space-y-4"
                        >
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
                        </motion.div>
                    )}

                    {/* Seer Step */}
                    {step === 'seer' && seers.length > 0 && (
                        <motion.div
                            key="seer"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="space-y-4"
                        >
                            <p className="text-cream/50 text-sm">Scegli un giocatore di cui scoprire il ruolo</p>

                            {!seerResult ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {alivePlayers.filter(p => p.id !== seers[0].id).map((player, i) => (
                                        <motion.button
                                            key={player.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.06 }}
                                            onClick={() => {
                                                setSeerResult({ name: player.name, role: player.role_label });
                                                dispatch({
                                                    type: ACTIONS.UPDATE_PLAYER,
                                                    payload: {
                                                        id: seers[0].id,
                                                        updates: { seer_used: true },
                                                    },
                                                });
                                            }}
                                            className="card-pulp p-4 text-center hover:border-morphine/50 transition-all"
                                            style={{ borderColor: 'rgba(167,139,250,0.3)' }}
                                        >
                                            <p className="text-headline text-lg text-morphine">{player.name}</p>
                                        </motion.button>
                                    ))}
                                </div>
                            ) : (
                                <PulpCard variant="vintage" className="p-5 space-y-3">
                                    <p className="text-headline text-lg text-morphine">{seerResult.name}</p>
                                    <p className="text-ui text-cream/70">Ruolo: <span className="text-morphine font-bold">{seerResult.role}</span></p>
                                    <p className="text-cream/40 text-xs italic">Mostra il telefono al Veggente, poi premi continua.</p>
                                    <NeonButton color="yellow" onClick={() => setStep('summary')}>
                                        Continua
                                    </NeonButton>
                                </PulpCard>
                            )}

                            {!seerResult && (
                                <button
                                    onClick={skipPhase}
                                    className="w-full btn-neon btn-neon-yellow py-3 text-sm"
                                >
                                    Non Attivare
                                </button>
                            )}
                        </motion.div>
                    )}

                    {/* Summary */}
                    {step === 'summary' && (
                        <motion.div
                            key="summary"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="space-y-4"
                        >
                            <PulpCard variant="vintage" className="p-5 space-y-2 max-h-64 overflow-y-auto">
                                {nightly_actions.length === 0 ? (
                                    <p className="text-cream/40 text-sm">Nessuna azione registrata</p>
                                ) : (
                                    nightly_actions.map((action, i) => (
                                        <motion.p
                                            key={i}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.08 }}
                                            className="text-ui text-sm text-cream/70"
                                        >
                                            &bull; {action.action_type}
                                        </motion.p>
                                    ))
                                )}
                            </PulpCard>

                            <NeonButton color="yellow" onClick={resolveAndContinue}>
                                Continua al Mattino
                            </NeonButton>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PageShell>
    );
}
