import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame, selectors } from '@/engine/gameState';
import { advance } from '@/engine/stateMachine';
import { checkWinCondition } from '@/engine/winCondition';
import { getRouteForPhase } from '@/engine/phaseRoutes';
import { Eye } from 'lucide-react';
import PageShell from '@/components/PageShell';
import Headline from '@/components/Headline';
import PulpCard from '@/components/PulpCard';
import NeonButton from '@/components/NeonButton';

export default function MediumReveal() {
    const navigate = useNavigate();
    const { state, dispatch, ACTIONS } = useGame();

    const currentRound = selectors.currentRound(state);
    const eliminatedPlayer = currentRound?.eliminated_player_id
        ? selectors.findPlayer(state, currentRound.eliminated_player_id)
        : null;

    const isKiller = eliminatedPlayer?.role === 'serial_killer';

    const continueToNight = () => {
        const { next, updates } = advance(state, s => checkWinCondition(s, true));

        dispatch({
            type: ACTIONS.SET_PHASE_AND_ROUND,
            payload: { phase: next, ...updates },
        });

        navigate(getRouteForPhase(next));
    };

    return (
        <PageShell>
            <div className="absolute inset-0 bg-gradient-to-b from-morphine/3 via-noir to-noir pointer-events-none" />

            <div className="p-6 max-w-lg mx-auto relative z-10 flex items-center justify-center min-h-screen">
                <div className="w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-morphine/10 flex items-center justify-center">
                                <Eye size={28} color="#a78bfa" strokeWidth={1.5} />
                            </div>
                        </div>

                        <Headline glow="purple" subtitle="Il medium ha investigato l'ultimo eliminato...">
                            MEDIUM REVEAL
                        </Headline>
                    </motion.div>

                    {eliminatedPlayer && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                        >
                            <PulpCard className="space-y-6" style={{ borderColor: 'rgba(167,139,250,0.3)' }}>
                                <div className="border border-morphine/30 rounded-xl p-5 text-center bg-noir/40">
                                    <h2 className="text-headline text-3xl text-cream">{eliminatedPlayer.name}</h2>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="text-center py-4"
                                >
                                    <p className="text-headline text-sm text-cream/40 tracking-widest mb-3">ERA UN...</p>
                                    <p className={`text-headline text-5xl ${isKiller ? 'text-blood glow-red' : 'text-poison glow-green'}`}>
                                        {eliminatedPlayer.role_label}
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.9 }}
                                    className="text-center"
                                >
                                    {isKiller ? (
                                        <p className="text-headline text-xl text-blood glow-red tracking-widest">COLPEVOLE</p>
                                    ) : (
                                        <p className="text-headline text-xl text-poison glow-green tracking-widest">INNOCENTE</p>
                                    )}
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.1 }}
                                >
                                    <NeonButton color={isKiller ? 'red' : 'green'} onClick={continueToNight}>
                                        Continua alla Notte Successiva
                                    </NeonButton>
                                </motion.div>
                            </PulpCard>
                        </motion.div>
                    )}
                </div>
            </div>
        </PageShell>
    );
}
