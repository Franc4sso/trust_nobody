import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame, selectors } from '@/engine/gameState';
import { tally } from '@/engine/vote';
import { checkWinCondition } from '@/engine/winCondition';
import { advance } from '@/engine/stateMachine';
import { getRouteForPhase } from '@/engine/phaseRoutes';
import { Scale, Skull } from 'lucide-react';
import PageShell from '@/components/PageShell';
import Headline from '@/components/Headline';
import PulpCard from '@/components/PulpCard';
import NeonButton from '@/components/NeonButton';

export default function VoteResult() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { state, dispatch, ACTIONS } = useGame();

    const isRunoff = searchParams.get('runoff') === '1';
    const result = tally(state, isRunoff);

    useEffect(() => {
        if (result.eliminated && !isRunoff) {
            setTimeout(() => {
                dispatch({
                    type: ACTIONS.UPDATE_PLAYER,
                    payload: {
                        id: result.eliminated.id,
                        updates: { is_alive: false },
                    },
                });

                dispatch({
                    type: ACTIONS.UPDATE_ROUND,
                    payload: {
                        round_number: state.current_round,
                        updates: { eliminated_player_id: result.eliminated.id },
                    },
                });

                const newState = {
                    ...state,
                    players: state.players.map(p =>
                        p.id === result.eliminated.id ? { ...p, is_alive: false } : p
                    ),
                };

                const winner = checkWinCondition(newState, true);
                if (winner) {
                    dispatch({
                        type: ACTIONS.SET_WINNER,
                        payload: winner,
                    });
                    navigate('/game-over');
                    return;
                }

                const hasMedium = newState.players.some(p => p.is_alive && p.role === 'medium');

                if (hasMedium) {
                    dispatch({
                        type: ACTIONS.SET_PHASE_AND_ROUND,
                        payload: { phase: 'medium_reveal' },
                    });
                    navigate('/vote/medium-reveal');
                } else {
                    const { next, updates } = advance(newState, s => checkWinCondition(s, true));
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

    return (
        <PageShell className="flex items-center justify-center p-4" phase="vote">
            <div className="max-w-2xl w-full">
                {/* Runoff announcement */}
                {result.runoff && !isRunoff && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <PulpCard variant="neon" className="p-8 space-y-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-neon-pink/10 mx-auto flex items-center justify-center">
                                <Scale size={28} color="#fb7185" strokeWidth={1.5} />
                            </div>
                            <Headline glow="pink">PAREGGIO!</Headline>
                            <p className="text-cream/50 text-sm">Ballottaggio tra:</p>

                            <div className="space-y-3">
                                {result.runoff.map((player, i) => (
                                    <motion.div
                                        key={player.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + i * 0.1 }}
                                        className="bg-noir/40 border border-neon-pink/20 rounded-xl p-4 text-center"
                                    >
                                        <p className="text-headline text-xl text-neon-pink">{player.name}</p>
                                        <p className="text-ui text-sm text-cream/40 mt-1">
                                            {result.counts[player.id]} voti
                                        </p>
                                    </motion.div>
                                ))}
                            </div>

                            <NeonButton color="pink" onClick={proceedToRunoff}>
                                Procedi al Ballottaggio
                            </NeonButton>
                        </PulpCard>
                    </motion.div>
                )}

                {/* Elimination result */}
                {result.eliminated && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <PulpCard variant="danger" className="p-8 space-y-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-blood/10 mx-auto flex items-center justify-center">
                                <Skull size={28} color="#d4364b" strokeWidth={1.5} />
                            </div>
                            <Headline glow="red">ELIMINATO</Headline>

                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-noir/50 border border-blood/30 rounded-xl p-6"
                            >
                                <p className="text-headline text-4xl text-blood glow-red">{result.eliminated.name}</p>
                                <p className="text-ui text-sm text-cream/40 mt-2">
                                    {result.counts[result.eliminated.id]} voti
                                </p>
                            </motion.div>

                            <p className="text-quote text-cream/35">Il gioco continua...</p>
                        </PulpCard>
                    </motion.div>
                )}

                {/* No result */}
                {!result.runoff && !result.eliminated && (
                    <PulpCard variant="vintage" className="p-8 text-center">
                        <Headline glow="yellow">CONTEGGIO VOTI</Headline>
                        <p className="text-cream/40">
                            Nessun voto ricevuto o errore nel conteggio.
                        </p>
                    </PulpCard>
                )}
            </div>
        </PageShell>
    );
}
