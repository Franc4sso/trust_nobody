import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/engine/gameState';
import { assignRoles } from '@/engine/roles';
import { generateNpcs } from '@/engine/npcGenerator';
import PageShell from '@/components/PageShell';
import Headline from '@/components/Headline';
import NeonButton from '@/components/NeonButton';

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
            const players = validNames.map((name, i) => ({
                id: crypto.randomUUID(),
                name: name.trim(),
                sort_order: i,
                is_alive: true,
                role: null,
                role_label: null,
                role_description: null,
            }));

            const playersWithRoles = assignRoles(players);
            const killerIds = playersWithRoles.filter(p => p.role === 'serial_killer').map(p => p.id);
            const npcs = await generateNpcs(playersWithRoles, killerIds);

            dispatch({
                type: ACTIONS.SET_PLAYERS,
                payload: playersWithRoles,
            });

            dispatch({
                type: ACTIONS.SET_NPCS,
                payload: npcs,
            });

            navigate('/roles');
        } catch (err) {
            console.error('Setup error:', err);
            setError('Errore durante la configurazione. Riprova.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageShell>
            <div className="p-6 max-w-2xl mx-auto">
                <Headline glow="yellow" subtitle="Inserisci i nomi dei sospetti">
                    SETUP PARTITA
                </Headline>

                {error && (
                    <div className="card-pulp card-danger p-4 mb-6 animate-shake">
                        <p className="text-ui text-blood font-semibold">{error}</p>
                    </div>
                )}

                <div className="space-y-3 mb-6">
                    {names.map((name, i) => (
                        <div key={i} className="flex gap-3 animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                            <div className="flex-1 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-headline text-tobacco text-sm">
                                    #{String(i + 1).padStart(2, '0')}
                                </span>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => updateName(i, e.target.value)}
                                    placeholder={`Sospetto ${i + 1}`}
                                    disabled={loading}
                                    className="input-typewriter w-full pl-14 disabled:opacity-40"
                                    maxLength={30}
                                />
                            </div>
                            {names.length > 4 && (
                                <button
                                    onClick={() => removePlayer(i)}
                                    disabled={loading}
                                    className="btn-neon btn-neon-red px-4 py-2 text-sm disabled:opacity-40"
                                >
                                    X
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex gap-3 mb-8">
                    {names.length < 10 && (
                        <NeonButton color="yellow" onClick={addPlayer} disabled={loading} className="flex-1">
                            + Aggiungi
                        </NeonButton>
                    )}
                    <NeonButton color="red" onClick={submit} disabled={loading} className="flex-1">
                        {loading ? 'Caricamento...' : 'Avanti'}
                    </NeonButton>
                </div>

                {loading && (
                    <div className="text-center space-y-3 animate-fade-in-up">
                        <p className="text-quote text-taxi text-lg">Generando profili sospetti...</p>
                        <div className="flex justify-center gap-2">
                            <div className="w-2 h-2 bg-taxi rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-taxi rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-taxi rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                )}

                <div className="mt-12 pt-6 border-t border-tobacco/30 text-center">
                    <p className="text-ui text-cream/40 text-xs">
                        Usa nomi di 4-10 giocatori per un'esperienza ottimale
                    </p>
                </div>
            </div>
        </PageShell>
    );
}
