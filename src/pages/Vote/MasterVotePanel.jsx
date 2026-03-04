import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, selectors } from '@/engine/gameState';
import { tally } from '@/engine/vote';
import PageShell from '@/components/PageShell';
import Headline from '@/components/Headline';
import PulpCard from '@/components/PulpCard';
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
        <PageShell>
            <div className="p-6 max-w-2xl mx-auto">
                <Headline
                    glow={runoffPlayers ? 'pink' : 'yellow'}
                    subtitle={`${alivePlayers.length - currentVoterIndex} votanti rimangono`}
                >
                    {runoffPlayers ? 'BALLOTTAGGIO' : 'IL VERDETTO'}
                </Headline>

                {runoffPlayers && (
                    <div className="card-pulp card-neon p-3 mb-6 text-center animate-neon-flicker">
                        <p className="text-headline text-sm text-neon-pink tracking-widest">BALLOTTAGGIO IN CORSO</p>
                    </div>
                )}

                {voter && (
                    <div className="space-y-5 animate-fade-in-up">
                        {/* Current voter spotlight */}
                        <div className="border-2 border-taxi rounded-lg p-5 text-center bg-noir/50 animate-spotlight">
                            <p className="text-headline text-sm text-cream/40 tracking-widest mb-1">Sta votando:</p>
                            <h2 className="text-headline text-3xl text-taxi">{voter.name}</h2>
                        </div>

                        {/* Targets */}
                        <div className="grid grid-cols-1 gap-3">
                            {targets.map((target) => (
                                <button
                                    key={target.id}
                                    onClick={() => setSelectedPlayerId(target.id)}
                                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                                        selectedPlayerId === target.id
                                            ? 'border-neon-pink bg-neon-pink/10 shadow-[0_0_20px_rgba(255,45,107,0.2)]'
                                            : 'border-asphalt bg-asphalt/50 hover:border-tobacco'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-ui font-semibold text-cream">{target.name}</span>
                                        {selectedPlayerId === target.id && (
                                            <span className="text-poison text-lg">&#10003;</span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <NeonButton color="red" onClick={submitVote} disabled={!selectedPlayerId}>
                            Vota
                        </NeonButton>

                        {/* Progress bar */}
                        <div className="h-2 bg-asphalt rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blood rounded-full transition-all duration-300"
                                style={{
                                    width: `${((currentVoterIndex + 1) / alivePlayers.length) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </PageShell>
    );
}
