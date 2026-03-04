import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, selectors } from '@/engine/gameState';

export default function NpcIntroductions() {
    const navigate = useNavigate();
    const { state, dispatch, ACTIONS } = useGame();

    const [currentNpcIndex, setCurrentNpcIndex] = useState(0);
    const npcs = state.npcs || [];

    const npc = npcs[currentNpcIndex];

    const nextNpc = () => {
        if (currentNpcIndex < npcs.length - 1) {
            setCurrentNpcIndex(currentNpcIndex + 1);
        } else {
            // All NPCs introduced, move to first vote
            dispatch({
                type: ACTIONS.SET_PHASE_AND_ROUND,
                payload: { phase: 'n1_vote' },
            });
            navigate('/n1/vote');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-amber-400">Presentazione NPC</h1>
                    <p className="text-slate-400 mt-2">
                        {npcs.length - currentNpcIndex - 1} NPC rimangono
                    </p>
                </div>

                {npc && (
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 space-y-6">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-amber-400">{npc.name}</h2>
                            <p className="text-slate-400 text-sm capitalize">
                                {npc.personality}
                            </p>
                        </div>

                        <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                            <p className="text-slate-300 text-sm leading-relaxed">
                                {npc.backstory}
                            </p>
                        </div>

                        <div className="space-y-3 bg-slate-700 rounded-lg p-4">
                            {(npc.connection_descriptions || []).map((conn, i) => (
                                <div key={i} className="text-slate-200 text-sm italic">
                                    "{conn.text}"
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={nextNpc}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-black font-bold py-3 px-6 rounded-lg transition"
                        >
                            NPC Successivo
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
