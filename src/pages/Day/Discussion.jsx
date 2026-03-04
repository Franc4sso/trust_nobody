import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, selectors } from '@/engine/gameState';

export default function Discussion() {
    const navigate = useNavigate();
    const { state, dispatch, ACTIONS } = useGame();

    const continueToVote = () => {
        dispatch({
            type: ACTIONS.SET_PHASE_AND_ROUND,
            payload: { phase: 'vote' },
        });
        navigate('/vote/panel');
    };

    const alivePlayers = selectors.alivePlayers(state);
    const currentRound = selectors.currentRound(state);
    const eliminated = currentRound?.eliminated_player_id
        ? selectors.findPlayer(state, currentRound.eliminated_player_id)
        : null;

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <div className="p-6 max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-amber-400 mb-2">Giorno {state.current_round}</h1>
                <p className="text-slate-400 mb-8">Discussione e Voto</p>

                {eliminated && (
                    <div className="bg-red-900 border border-red-700 rounded-lg p-6 mb-8">
                        <p className="text-red-200 mb-2">Ucciso durante la notte:</p>
                        <p className="text-2xl font-bold text-red-400">{eliminated.name}</p>
                    </div>
                )}

                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4">Giocatori Vivi</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {alivePlayers.map((player) => (
                            <div key={player.id} className="bg-slate-700 rounded p-3 text-center">
                                <p className="font-semibold">{player.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-amber-900 border border-amber-700 rounded-lg p-6 text-center mb-8">
                    <p className="text-amber-200 mb-4">
                        Discutete e decidete insieme di chi non vi fidate.
                    </p>
                    <p className="text-sm text-amber-300">
                        Quando siete pronti, procedete al voto.
                    </p>
                </div>

                <button
                    onClick={continueToVote}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-black font-bold py-3 px-6 rounded-lg transition"
                >
                    Procedi al Voto
                </button>
            </div>
        </div>
    );
}
