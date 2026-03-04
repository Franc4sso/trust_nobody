import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, selectors } from '@/engine/gameState';

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
        // Passa direttamente alla notte (senza mattino, niente indizio dopo primo voto)
        dispatch({
            type: ACTIONS.SET_PHASE_AND_ROUND,
            payload: { phase: 'night' },
        });
        navigate('/night');
    };

    if (votingComplete) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-4">
                <div className="max-w-lg w-full">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-blue-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-lg"></div>
                            <div className="relative">
                                <h1 className="text-5xl mb-4">🗳️</h1>
                                <h2 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                                    Votazione Completata!
                                </h2>
                            </div>
                        </div>

                        <p className="text-slate-300 text-lg">
                            Tutte i giocatori hanno votato. Era solo per sentire il sentiment della giocata.
                        </p>

                        <div className="bg-black/40 rounded-xl p-6 border border-blue-400/30 space-y-3">
                            <p className="text-slate-300 font-semibold text-sm uppercase tracking-widest">Cosa succede ora:</p>
                            <ul className="text-slate-400 text-sm space-y-2">
                                <li>🌙 <span className="text-red-400 font-bold">Serial Killer</span> agisce di notte</li>
                                <li>🛡️ <span className="text-blue-400 font-bold">Guardiano</span> protegge</li>
                                <li>🔮 <span className="text-purple-400 font-bold">Analista</span> può usare il potere</li>
                            </ul>
                        </div>

                        <button
                            onClick={continueToNight}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-700 hover:to-purple-600 text-white font-black py-4 px-6 rounded-xl transition transform hover:scale-105 text-lg shadow-lg"
                        >
                            → Entra nella Notte 1
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="p-6 max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2">
                        Prima Votazione
                    </h1>
                    <p className="text-blue-300 font-semibold text-sm">
                        Votate tra di voi • Sentiment Analysis
                    </p>
                </div>

                {voter && (
                    <div className="space-y-6">
                        {/* Current Voter Card */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/10 rounded-2xl blur-xl"></div>
                            <div className="relative bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border-2 border-blue-500/50 rounded-2xl p-6 text-center">
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">
                                    Sta votando:
                                </p>
                                <h2 className="text-3xl font-black text-blue-300">{voter.name}</h2>
                                <p className="text-slate-400 text-sm mt-2">
                                    Chi sospetti di più?
                                </p>
                            </div>
                        </div>

                        {/* Players Grid */}
                        <div className="grid grid-cols-1 gap-3">
                            {targets.map((target) => (
                                <button
                                    key={target.id}
                                    onClick={() => setSelectedPlayerId(target.id)}
                                    className={`p-5 rounded-xl border-2 transition transform hover:scale-105 font-bold text-lg ${
                                        selectedPlayerId === target.id
                                            ? 'border-blue-400 bg-blue-900/60 shadow-lg shadow-blue-500/50'
                                            : 'border-slate-600 bg-slate-800/50 hover:border-blue-500/70'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{target.name}</span>
                                        {selectedPlayerId === target.id && <span className="text-xl">✓</span>}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Vote Button */}
                        <button
                            onClick={submitVote}
                            disabled={!selectedPlayerId}
                            className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black py-4 px-6 rounded-xl transition transform hover:scale-105 text-lg shadow-lg"
                        >
                            Vota {selectedPlayerId && '✓'}
                        </button>

                        {/* Progress */}
                        <div className="flex items-center justify-between text-sm font-semibold text-slate-400">
                            <span>Votanti: {currentVoterIndex + 1}/{alivePlayers.length}</span>
                            <span>Rimangono: {alivePlayers.length - currentVoterIndex - 1}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 rounded-full"
                                style={{
                                    width: `${((currentVoterIndex + 1) / alivePlayers.length) * 100}%`,
                                }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
