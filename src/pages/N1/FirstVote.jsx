import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame, selectors } from '@/engine/gameState';
import { Skull, Shield, Scan, CheckCircle } from 'lucide-react';
import PageShell from '@/components/PageShell';
import Headline from '@/components/Headline';
import PulpCard from '@/components/PulpCard';
import NeonButton from '@/components/NeonButton';

export default function FirstVote() {
    const navigate = useNavigate();
    const { state, dispatch, ACTIONS } = useGame();

    const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
    const [selectedPlayerId, setSelectedPlayerId] = useState(null);
    const [votingComplete, setVotingComplete] = useState(false);

    const alivePlayers = selectors.alivePlayers(state);
    const voter = alivePlayers[currentVoterIndex];
    const targets = alivePlayers.filter(p => p.id !== voter?.id);

    const submitVote = () => {
        if (!selectedPlayerId) return;

        dispatch({
            type: ACTIONS.ADD_VOTE,
            payload: {
                round_number: state.current_round,
                voter_player_id: voter.id,
                target_player_id: selectedPlayerId,
                is_runoff: false,
            },
        });

        if (currentVoterIndex < alivePlayers.length - 1) {
            setCurrentVoterIndex(currentVoterIndex + 1);
            setSelectedPlayerId(null);
        } else {
            setVotingComplete(true);
        }
    };

    const continueToNight = () => {
        dispatch({
            type: ACTIONS.SET_PHASE_AND_ROUND,
            payload: { phase: 'night', round: 1 },
        });
        navigate('/night');
    };

    if (votingComplete) {
        return (
            <PageShell className="flex items-center justify-center p-4">
                <div className="max-w-lg w-full">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <PulpCard variant="info" className="text-center space-y-6 p-8">
                            <div className="w-16 h-16 rounded-full bg-neon-blue/10 mx-auto flex items-center justify-center">
                                <CheckCircle size={28} color="#60a5fa" strokeWidth={1.5} />
                            </div>
                            <Headline glow="blue">VOTAZIONE COMPLETATA</Headline>

                            <p className="text-cream/60 text-sm">
                                Tutti i giocatori hanno votato. Era solo per sentire il sentiment.
                            </p>

                            <div className="card-glass p-5 space-y-3 text-left">
                                <p className="text-headline text-xs text-cream/40 tracking-widest">Cosa succede ora:</p>
                                <div className="flex items-center gap-3">
                                    <Skull size={16} color="#d4364b" strokeWidth={1.5} />
                                    <p className="text-ui text-sm text-cream/70"><span className="text-blood font-semibold">Serial Killer</span> agisce di notte</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Shield size={16} color="#3ecf8e" strokeWidth={1.5} />
                                    <p className="text-ui text-sm text-cream/70"><span className="text-poison font-semibold">Guardiano</span> protegge</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Scan size={16} color="#60a5fa" strokeWidth={1.5} />
                                    <p className="text-ui text-sm text-cream/70"><span className="text-neon-blue font-semibold">Analista</span> puo' usare il potere</p>
                                </div>
                            </div>

                            <NeonButton color="blue" onClick={continueToNight}>
                                Entra nella Notte 1
                            </NeonButton>
                        </PulpCard>
                    </motion.div>
                </div>
            </PageShell>
        );
    }

    return (
        <PageShell>
            <div className="p-6 max-w-2xl mx-auto">
                <Headline glow="blue" subtitle="Votate tra di voi — Sentiment Analysis">
                    PRIMA VOTAZIONE
                </Headline>

                {voter && (
                    <motion.div
                        key={currentVoterIndex}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-5"
                    >
                        {/* Current voter spotlight */}
                        <div className="border border-taxi/40 rounded-xl p-5 text-center bg-noir/40 animate-spotlight">
                            <p className="text-headline text-xs text-cream/40 tracking-widest mb-1">Sta votando:</p>
                            <h2 className="text-headline text-4xl text-taxi">{voter.name}</h2>
                            <p className="text-quote text-cream/40 text-sm mt-1">Chi sospetti di piu'?</p>
                        </div>

                        {/* Targets grid */}
                        <div className="space-y-2">
                            {targets.map((target, i) => (
                                <motion.button
                                    key={target.id}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => setSelectedPlayerId(target.id)}
                                    className={`w-full p-4 rounded-xl border transition-all text-left ${
                                        selectedPlayerId === target.id
                                            ? 'border-neon-pink/50 bg-neon-pink/8 shadow-[0_0_20px_rgba(251,113,133,0.1)]'
                                            : 'border-tobacco bg-asphalt/50 hover:border-cream/15'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-ui font-medium text-cream">{target.name}</span>
                                        {selectedPlayerId === target.id && (
                                            <CheckCircle size={18} className="text-neon-pink" />
                                        )}
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        <NeonButton color="red" onClick={submitVote} disabled={!selectedPlayerId}>
                            Vota
                        </NeonButton>

                        {/* Progress */}
                        <div className="flex items-center justify-between text-ui text-xs text-cream/30">
                            <span>Votanti: {currentVoterIndex + 1}/{alivePlayers.length}</span>
                            <span>Rimangono: {alivePlayers.length - currentVoterIndex - 1}</span>
                        </div>

                        <div className="h-1.5 bg-tobacco rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-blood rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentVoterIndex + 1) / alivePlayers.length) * 100}%` }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                            />
                        </div>
                    </motion.div>
                )}
            </div>
        </PageShell>
    );
}
