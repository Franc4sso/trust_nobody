import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, selectors } from '@/engine/gameState';
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
                <div className="max-w-lg w-full animate-fade-in-up">
                    <PulpCard variant="info" className="text-center space-y-6 p-8">
                        <Headline glow="blue">VOTAZIONE COMPLETATA</Headline>

                        <p className="text-cream/70">
                            Tutti i giocatori hanno votato. Era solo per sentire il sentiment.
                        </p>

                        <div className="card-pulp p-5 space-y-2">
                            <p className="text-headline text-sm text-cream/40 tracking-widest">Cosa succede ora:</p>
                            <p className="text-ui text-sm"><span className="text-blood font-bold">Serial Killer</span> agisce di notte</p>
                            <p className="text-ui text-sm"><span className="text-poison font-bold">Guardiano</span> protegge</p>
                            <p className="text-ui text-sm"><span className="text-morphine font-bold">Analista</span> può usare il potere</p>
                        </div>

                        <NeonButton color="blue" onClick={continueToNight}>
                            Entra nella Notte 1
                        </NeonButton>
                    </PulpCard>
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
                    <div className="space-y-5 animate-fade-in-up">
                        {/* Current voter spotlight */}
                        <div className="border-2 border-taxi rounded-lg p-5 text-center bg-noir/50 animate-spotlight">
                            <p className="text-headline text-sm text-cream/40 tracking-widest mb-1">Sta votando:</p>
                            <h2 className="text-headline text-4xl text-taxi">{voter.name}</h2>
                            <p className="text-quote text-cream/50 text-sm mt-1">Chi sospetti di più?</p>
                        </div>

                        {/* Targets grid */}
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
                                            <span className="text-neon-pink text-lg">&#10003;</span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Vote button */}
                        <NeonButton color="red" onClick={submitVote} disabled={!selectedPlayerId}>
                            Vota
                        </NeonButton>

                        {/* Progress */}
                        <div className="flex items-center justify-between text-ui text-xs text-cream/40">
                            <span>Votanti: {currentVoterIndex + 1}/{alivePlayers.length}</span>
                            <span>Rimangono: {alivePlayers.length - currentVoterIndex - 1}</span>
                        </div>

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
