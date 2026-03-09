import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame, selectors } from '@/engine/gameState';
import { AlertTriangle } from 'lucide-react';
import PageShell from '@/components/PageShell';
import Headline from '@/components/Headline';
import PulpCard from '@/components/PulpCard';
import NeonButton from '@/components/NeonButton';

export default function NpcIntroductions() {
    const navigate = useNavigate();
    const { state, dispatch, ACTIONS } = useGame();

    const [currentNpcIndex, setCurrentNpcIndex] = useState(0);
    const npcs = state.npcs || [];

    const npc = npcs[currentNpcIndex];

    const nextNpc = () => {
        if (currentNpcIndex < npcs.length - 1) {
            setCurrentNpcIndex(currentNpcIndex + 1);
        } else {
            dispatch({
                type: ACTIONS.SET_PHASE_AND_ROUND,
                payload: { phase: 'n1_vote' },
            });
            navigate('/n1/vote');
        }
    };

    return (
        <PageShell>
            <div className="p-6 max-w-lg mx-auto">
                <Headline glow="yellow" subtitle={`${npcs.length - currentNpcIndex - 1} profili rimangono`}>
                    PROFILI SOSPETTI
                </Headline>

                {npc && (
                    <motion.div
                        key={npc.id}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.35 }}
                    >
                        <PulpCard variant="vintage" className="space-y-6">
                            {/* NPC avatar + name */}
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full border-2 border-taxi/40 bg-surface-2 mx-auto mb-4 flex items-center justify-center">
                                    <span className="text-headline text-3xl text-taxi">
                                        {npc.name.charAt(0)}
                                    </span>
                                </div>
                                <h2 className="text-headline text-3xl text-taxi">{npc.name}</h2>
                                <p className="text-quote text-cream/50 capitalize mt-1">{npc.personality}</p>
                            </div>

                            {/* Backstory */}
                            <div className="card-glass p-5">
                                <p className="text-cream/70 text-sm leading-relaxed">
                                    {npc.backstory}
                                </p>
                            </div>

                            {/* Unreliable warning */}
                            {npc.unreliable && (
                                <motion.div
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="card-glass p-4 border-l-4 border-amber-400/60 flex gap-3 items-start"
                                >
                                    <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-ui text-xs text-amber-400 font-semibold tracking-wider mb-1">INAFFIDABILE</p>
                                        <p className="text-ui text-cream/50 text-xs leading-relaxed">
                                            I suoi indizi potrebbero non essere attendibili.
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Connections */}
                            <div className="space-y-2 bg-noir/40 rounded-xl p-4 border-l-2 border-taxi/30">
                                {(npc.connection_descriptions || []).map((conn, i) => {
                                    const playerName = state.players.find(p => p.id === conn.player_id)?.name;
                                    return (
                                        <motion.p
                                            key={i}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 + i * 0.08 }}
                                            className="text-quote text-cream/60 text-sm"
                                        >
                                            {playerName && !conn.text.startsWith(playerName) && (
                                                <span className="text-taxi not-italic font-bold">{playerName} — </span>
                                            )}
                                            &ldquo;{conn.text}&rdquo;
                                        </motion.p>
                                    );
                                })}
                            </div>

                            <NeonButton color="yellow" onClick={nextNpc}>
                                {currentNpcIndex < npcs.length - 1 ? 'Prossimo Fascicolo' : 'Procedi'}
                            </NeonButton>
                        </PulpCard>
                    </motion.div>
                )}

                {/* Progress */}
                <div className="mt-6 flex gap-2 justify-center">
                    {npcs.map((_, i) => (
                        <motion.div
                            key={i}
                            layout
                            className={`h-1.5 rounded-full transition-colors duration-300 ${
                                i <= currentNpcIndex ? 'w-6 bg-taxi' : 'w-3 bg-tobacco'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </PageShell>
    );
}
