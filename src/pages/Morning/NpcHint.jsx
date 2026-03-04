import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, selectors } from '@/engine/gameState';
import { generateHint } from '@/engine/hints';

export default function NpcHint() {
    const navigate = useNavigate();
    const { state, dispatch, ACTIONS } = useGame();

    const currentRound = selectors.currentRound(state);
    const hintNpc = currentRound?.hint_npc_id 
        ? selectors.findNpc(state, currentRound.hint_npc_id)
        : null;

    const isThreatened = hintNpc?.is_threatened || false;
    const hint = hintNpc ? generateHint(state, hintNpc, isThreatened) : '';

    const continueToDay = () => {
        dispatch({
            type: ACTIONS.SET_PHASE_AND_ROUND,
            payload: { phase: 'day' },
        });
        navigate('/day');
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-amber-400">Mattino - Indizio</h1>
                    <p className="text-slate-400 mt-2">Round {state.current_round}</p>
                </div>

                {hintNpc && (
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-amber-400">{hintNpc.name}</h2>
                        </div>

                        <div className="bg-slate-700 rounded-lg p-6 border-l-4 border-amber-400">
                            <p className="text-lg text-slate-100 leading-relaxed italic">
                                "{hint}"
                            </p>
                        </div>

                        <button
                            onClick={continueToDay}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-black font-bold py-3 px-6 rounded-lg transition"
                        >
                            Continua al Giorno
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
