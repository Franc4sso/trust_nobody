import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, selectors } from '@/engine/gameState';
import { tally } from '@/engine/vote';

export default function MasterVotePanel() {
    const navigate = useNavigate();
    const { state, dispatch, ACTIONS } = useGame();

    const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
    const [selectedPlayerId, setSelectedPlayerId] = useState(null);
    const [runoffPlayers, setRunoffPlayers] = useState(null);

    const alivePlayers = selectors.alivePlayers(state);
    const voter = alivePlayers[currentVoterIndex];

    const targets = runoffPlayers || alivePlayers.filter(p => p.id !== voter.id);

    const submitVote = () => {
        if (!selectedPlayerId) return;

        // Add vote
        dispatch({
            type: ACTIONS.ADD_VOTE,
            payload: {
                round_number: state.current_round,
                voter_player_id: voter.id,
                target_player_id: selectedPlayerId,
                is_runoff: runoffPlayers !== null,
            },
        });

        // Move to next voter or finish
        if (currentVoterIndex < alivePlayers.length - 1) {
            setCurrentVoterIndex(currentVoterIndex + 1);
            setSelectedPlayerId(null);
        } else {
            // Check tally
            const result = tally(state, runoffPlayers !== null);

            if (result.runoff) {
                // Start runoff
                setRunoffPlayers(result.runoff);
                setCurrentVoterIndex(0);
                setSelectedPlayerId(null);
            } else {
                // Vote is over, go to result
                navigate('/vote/result');
            }
        }
    };

    const processRunoff = () => {
        const result = tally(state, true);
        navigate('/vote/result');
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <div className="p-6 max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-amber-400">
                        {runoffPlayers ? 'Ballottaggio' : 'Voto Giornaliero'}
                    </h1>
                    <p className="text-slate-400 mt-2">
                        {alivePlayers.length - currentVoterIndex} votanti rimangono
                    </p>
                </div>

                {voter && (
                    <>
                        <div className="bg-amber-900 border border-amber-700 rounded-lg p-4 mb-6 text-center">
                            <p className="text-amber-200 font-semibold">{voter.name}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 mb-6">
                            {targets.map((target) => (
                                <button
                                    key={target.id}
                                    onClick={() => setSelectedPlayerId(target.id)}
                                    className={`p-4 rounded-lg border-2 transition ${
                                        selectedPlayerId === target.id
                                            ? 'border-amber-400 bg-amber-900'
                                            : 'border-slate-700 bg-slate-800 hover:border-amber-600'
                                    }`}
                                >
                                    <p className="font-bold">{target.name}</p>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={submitVote}
                            disabled={!selectedPlayerId}
                            className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-black font-bold py-3 px-6 rounded-lg transition"
                        >
                            Vota
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
