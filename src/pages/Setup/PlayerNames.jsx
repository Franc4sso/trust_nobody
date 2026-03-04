import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/engine/gameState';
import { assignRoles } from '@/engine/roles';
import { generateNpcs } from '@/engine/npcGenerator';

export default function PlayerNames() {
    const navigate = useNavigate();
    const { state, dispatch, ACTIONS } = useGame();

    const [names, setNames] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const updateName = (index, value) => {
        const updated = [...names];
        updated[index] = value;
        setNames(updated);
    };

    const addPlayer = () => {
        if (names.length < 10) {
            setNames([...names, '']);
        }
    };

    const removePlayer = (index) => {
        if (names.length > 4) {
            setNames(names.filter((_, i) => i !== index));
        }
    };

    const submit = async () => {
        const validNames = names.filter((n) => n.trim());
        if (validNames.length < 4) {
            setError('Servono almeno 4 giocatori');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Create player objects with sort_order
            const players = validNames.map((name, i) => ({
                id: crypto.randomUUID(),
                name: name.trim(),
                sort_order: i,
                is_alive: true,
                role: null,
                role_label: null,
                role_description: null,
            }));

            // Assign roles
            const playersWithRoles = assignRoles(players);

            // Generate NPCs (async, may call Groq)
            const npcs = await generateNpcs(players);

            // Update game state
            dispatch({
                type: ACTIONS.SET_PLAYERS,
                payload: playersWithRoles,
            });

            dispatch({
                type: ACTIONS.SET_NPCS,
                payload: npcs,
            });

            // Navigate to role reveal
            navigate('/roles');
        } catch (err) {
            console.error('Setup error:', err);
            setError('Errore durante la configurazione. Riprova.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="p-6 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent mb-2">
                        Setup Partita
                    </h1>
                    <p className="text-amber-300 font-semibold">Inserisci i nomi dei giocatori</p>
                </div>

                {error && (
                    <div className="bg-red-900/50 border border-red-500/70 text-red-200 px-5 py-4 rounded-2xl mb-6 font-semibold backdrop-blur">
                        ⚠️ {error}
                    </div>
                )}

                <div className="space-y-3 mb-6">
                    {names.map((name, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="flex-1 relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-xl opacity-10 blur"></div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => updateName(i, e.target.value)}
                                    placeholder={`Giocatore ${i + 1}`}
                                    disabled={loading}
                                    className="relative w-full bg-slate-800 border-2 border-amber-500/30 hover:border-amber-500/60 focus:border-amber-500 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none disabled:opacity-50 transition"
                                    maxLength={30}
                                />
                            </div>
                            {names.length > 4 && (
                                <button
                                    onClick={() => removePlayer(i)}
                                    disabled={loading}
                                    className="bg-red-900/60 hover:bg-red-800 disabled:opacity-50 px-4 py-3 rounded-xl transition border border-red-500/50 font-bold"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex gap-3 mb-8">
                    {names.length < 10 && (
                        <button
                            onClick={addPlayer}
                            disabled={loading}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 px-4 py-3 rounded-xl border-2 border-slate-600 hover:border-slate-500 transition font-bold text-white"
                        >
                            + Aggiungi Giocatore
                        </button>
                    )}
                    <button
                        onClick={submit}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 disabled:opacity-50 font-black px-4 py-3 rounded-xl text-black transition transform hover:scale-105 shadow-lg"
                    >
                        {loading ? '⏳ Caricamento...' : '→ Avanti'}
                    </button>
                </div>

                {loading && (
                    <div className="text-center space-y-3">
                        <div className="text-amber-300 font-bold">Generazione NPC in corso...</div>
                        <div className="flex justify-center gap-2">
                            <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
                            <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse delay-100"></div>
                            <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse delay-200"></div>
                        </div>
                    </div>
                )}

                <div className="mt-12 pt-8 border-t border-slate-700 text-center">
                    <p className="text-slate-400 text-sm">
                        💡 Suggerimento: Usa nomi di 4-10 giocatori per un'esperienza ottimale
                    </p>
                </div>
            </div>
        </div>
    );
}
