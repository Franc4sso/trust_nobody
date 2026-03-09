import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame, selectors } from '@/engine/gameState';
import { generateHint } from '@/engine/hints';
import { AlertTriangle, Quote } from 'lucide-react';
import PageShell from '@/components/PageShell';
import Headline from '@/components/Headline';
import PulpCard from '@/components/PulpCard';
import NeonButton from '@/components/NeonButton';

export default function NpcHint() {
    const navigate = useNavigate();
    const { state, dispatch, ACTIONS } = useGame();

    const currentRound = selectors.currentRound(state);
    const hintNpc = currentRound?.hint_npc_id
        ? selectors.findNpc(state, currentRound.hint_npc_id)
        : null;

    const isThreatened = hintNpc?.is_threatened || false;
    const hintRef = useRef(null);
    if (hintRef.current === null && hintNpc) {
        hintRef.current = generateHint(state, hintNpc, isThreatened);
    }
    const hint = hintRef.current ?? '';
    const analystResult = currentRound?.analyst_target_npc_id ? {
        npcName: currentRound.analyst_target_npc_name,
        threatened: currentRound.analyst_npc_threatened,
    } : null;

    useEffect(() => {
        if (hint && hintNpc && currentRound && !currentRound.hint_text) {
            dispatch({
                type: ACTIONS.UPDATE_ROUND,
                payload: {
                    round_number: currentRound.round_number,
                    updates: {
                        hint_text: hint,
                        hint_npc_name: hintNpc.name,
                        hint_npc_alive: hintNpc.is_alive,
                        hint_npc_unreliable: hintNpc.unreliable || false,
                    },
                },
            });
        }
    }, [hint, hintNpc, currentRound, dispatch, ACTIONS]);

    const continueToDay = () => {
        dispatch({
            type: ACTIONS.SET_PHASE_AND_ROUND,
            payload: { phase: 'day' },
        });
        navigate('/day');
    };

    return (
        <PageShell phase="morning">
            <div className="p-6 max-w-2xl mx-auto relative z-10">
                <Headline glow="yellow" subtitle={`Round ${state.current_round}`}>
                    MATTINO — INDIZIO
                </Headline>

                <PulpCard variant="vintage" className="space-y-6">
                    {hintNpc ? (
                        <>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center relative"
                            >
                                {!hintNpc.is_alive && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                        <span className="text-headline text-4xl text-blood glow-red -rotate-12 border-2 border-blood/60 px-4 py-1">
                                            VITTIMA
                                        </span>
                                    </div>
                                )}
                                <div className="w-16 h-16 rounded-full border-2 border-taxi/40 bg-surface-2 mx-auto mb-3 flex items-center justify-center">
                                    <span className="text-headline text-2xl text-taxi">
                                        {hintNpc.name.charAt(0)}
                                    </span>
                                </div>
                                <h2 className="text-headline text-3xl text-taxi">{hintNpc.name}</h2>
                            </motion.div>

                            {hintNpc.unreliable && (
                                <motion.div
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="card-glass p-3 border-l-4 border-amber-400/60 flex gap-3 items-center"
                                >
                                    <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
                                    <p className="text-ui text-amber-400 text-xs font-semibold tracking-wider">INAFFIDABILE — potrebbe non dire la verita'</p>
                                </motion.div>
                            )}

                            {/* Main hint */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-noir/40 rounded-xl p-6 border-l-4 border-taxi/40 relative"
                            >
                                <Quote size={28} className="text-taxi/15 absolute top-3 left-4" />
                                <p className="text-quote text-lg text-cream/80 leading-relaxed pl-4 pt-2">
                                    {hint}
                                </p>
                            </motion.div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-cream/40">Nessun NPC disponibile questa mattina.</p>
                        </div>
                    )}

                    {analystResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <PulpCard variant="info" className="p-4 border-l-4 border-l-neon-blue">
                                <p className="text-headline text-xs text-neon-blue tracking-widest mb-2">INDAGINE DELL'ANALISTA</p>
                                <p className="text-quote text-cream/80 leading-relaxed">
                                    {analystResult.threatened
                                        ? <>&ldquo;Ho indagato su <span className="text-neon-blue font-bold">{analystResult.npcName}</span>: è stato <span className="text-blood font-bold">minacciato dal killer</span>. I suoi indizi potrebbero essere falsi.&rdquo;</>
                                        : <>&ldquo;Ho indagato su <span className="text-neon-blue font-bold">{analystResult.npcName}</span>: <span className="text-poison font-bold">parla liberamente</span>. I suoi indizi sono affidabili.&rdquo;</>
                                    }
                                </p>
                            </PulpCard>
                        </motion.div>
                    )}

                    <NeonButton color="yellow" onClick={continueToDay}>
                        Continua al Giorno
                    </NeonButton>
                </PulpCard>
            </div>
        </PageShell>
    );
}
