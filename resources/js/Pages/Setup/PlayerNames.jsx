import { useState } from 'react';
import { router } from '@inertiajs/react';
import PhaseHeader from '../../Components/PhaseHeader';

export default function PlayerNames({ game }) {
    const [names, setNames] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');

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

    const submit = () => {
        const validNames = names.filter((n) => n.trim());
        if (validNames.length < 4) {
            setError('Servono almeno 4 giocatori');
            return;
        }
        router.post(`/games/${game.id}/setup/names`, { names: validNames });
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <PhaseHeader phase="setup" subtitle="Inserisci i nomi dei giocatori" />

            <div className="p-6 max-w-md mx-auto space-y-3">
                {names.map((name, i) => (
                    <div key={i} className="flex gap-2">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => updateName(i, e.target.value)}
                            placeholder={`Giocatore ${i + 1}`}
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                            maxLength={30}
                        />
                        {names.length > 4 && (
                            <button
                                onClick={() => removePlayer(i)}
                                className="text-gray-500 hover:text-red-400 px-2"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}

                {names.length < 10 && (
                    <button
                        onClick={addPlayer}
                        className="w-full border-2 border-dashed border-gray-700 rounded-xl py-3 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                    >
                        + Aggiungi giocatore
                    </button>
                )}

                {error && (
                    <p className="text-red-400 text-sm text-center">{error}</p>
                )}

                <button
                    onClick={submit}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl mt-6 transition-colors"
                >
                    Inizia Partita
                </button>

                <p className="text-center text-gray-500 text-sm mt-2">
                    {names.filter((n) => n.trim()).length} giocatori
                    (min 4, max 10)
                </p>
            </div>
        </div>
    );
}
