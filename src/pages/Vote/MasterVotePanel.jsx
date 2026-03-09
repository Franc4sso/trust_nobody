import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame, selectors } from '@/engine/gameState';
import { tally } from '@/engine/vote';
import { CheckCircle, AlertCircle } from 'lucide-react';
import PageShell from '@/components/PageShell';
import Headline from '@/components/Headline';
import NeonButton from '@/components/NeonButton';

export default function MasterVotePanel() {
    const navigate = useNavigate();
    const { state, dispatch, ACTIONS } = useGame();

    const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
    const [selectedPlayerId, setSelectedPlayerId] = useState(null);
    const [runoffPlayers, setRunoffPlayers] = useState(null);

    const alivePlayers = selectors.alivePlayers(state);

    useEffect(() => {
        if (state.runoff_active && state.runoff_player_ids?.length > 0 && runoffPlayers === null) {
            const restored = alivePlayers.filter(p => state.runoff_player_ids.includes(p.id));
            if (restored.length > 0) {
                setRunoffPlayers(restored);
            }
        }
    }, [state.runoff_active]);

    const voter = alivePlayers[currentVoterIndex];
    const targets = runoffPlayers || alivePlayers.filter(p => p.id !== voter.id);

    const submitVote = () => {
        if (!selectedPlayerId) return;

        const newVote = {
            round_number: state.current_round,
            voter_player_id: voter.id,
            target_player_id: selectedPlayerId,
            is_runoff: runoffPlayers !== null,
        };

        dispatch({
            type: ACTIONS.ADD_VOTE,
            payload: newVote,
        });

        if (currentVoterIndex < alivePlayers.length - 1) {
            setCurrentVoterIndex(currentVoterIndex + 1);
            setSelectedPlayerId(null);
        } else {
            const stateWithLastVote = { ...state, votes: [...state.votes, newVote] };
            const result = tally(stateWithLastVote, runoffPlayers !== null);

            if (result.runoff) {
                dispatch({
                    type: ACTIONS.SET_RUNOFF,
                    payload: { active: true, player_ids: result.runoff.map(p => p.id) },
                });
                setRunoffPlayers(result.runoff);
                setCurrentVoterIndex(0);
                setSelectedPlayerId(null);
            } else {
                dispatch({
                    type: ACTIONS.SET_RUNOFF,
                    payload: { active: false, player_ids: [] },
                });
                navigate('/vote/result');
            }
        }
    };

    return (
        <PageShell phase="vote">
            <div className="p-6 max-w-2xl mx-auto">
                <Headline
                    glow={runoffPlayers ? 'pink' : 'yellow'}
                    subtitle={`${alivePlayers.length - currentVoterIndex} votanti rimangono`}
                >
                    {runoffPlayers ? 'BALLOTTAGGIO' : 'IL VERDETTO'}
                </Headline>

                {runoffPlayers && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card-glass p-3 mb-6 text-center border border-neon-pink/20 flex items-center justify-center gap-2"
                    >
                        <AlertCircle size={16} className="text-neon-pink" />
                        <p className="text-headline text-sm text-neon-pink tracking-widest">BALLOTTAGGIO IN CORSO</p>
                    </motion.div>
                )}

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
                            <h2 className="text-headline text-3xl text-taxi">{voter.name}</h2>
                        </div>

                        {/* Targets */}
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

                        {/* Progress bar */}
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
