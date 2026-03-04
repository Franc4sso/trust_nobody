import { router } from '@inertiajs/react';
import PhaseHeader from '../../Components/PhaseHeader';

export default function NightSummary({ game, round }) {
    const advance = () => {
        router.post(`/games/${game.id}/advance`);
    };

    return (
        <div className="min-h-screen bg-indigo-950 text-white">
            <PhaseHeader phase="night" subtitle="Riepilogo della notte (solo Master)" />

            <div className="p-6 max-w-md mx-auto">
                <div className="bg-indigo-900/50 rounded-xl p-6 mb-6 border border-indigo-800">
                    <h3 className="text-lg font-bold mb-4 text-center">
                        Risultati della notte
                    </h3>

                    {round.killer_action === 'kill' && (
                        <div className="mb-3">
                            <p className="text-red-400">
                                🔪 Il killer ha tentato di uccidere{' '}
                                <strong>{round.target_name}</strong>
                            </p>
                            {round.kill_blocked ? (
                                <p className="text-blue-400 mt-1">
                                    🛡️ Il guardiano ha protetto{' '}
                                    {round.target_name}! L'attacco è stato bloccato.
                                </p>
                            ) : (
                                <p className="text-red-300 mt-1">
                                    ☠️ {round.target_name} è stato ucciso.
                                </p>
                            )}
                        </div>
                    )}

                    {round.killer_action === 'threaten' && (
                        <div className="mb-3">
                            <p className="text-yellow-400">
                                ⚠️ Il killer ha minacciato{' '}
                                <strong>{round.target_name}</strong>
                            </p>
                            <p className="text-yellow-300 text-sm mt-1">
                                {round.target_name} darà indizi fuorvianti.
                            </p>
                        </div>
                    )}

                    {round.guardian_target && round.killer_action === 'kill' && !round.kill_blocked && (
                        <p className="text-gray-400 text-sm mt-2">
                            Il guardiano proteggeva {round.guardian_target}.
                        </p>
                    )}
                </div>

                <p className="text-center text-gray-400 text-sm mb-6">
                    Solo il master dovrebbe vedere questa schermata.
                    Premi per procedere alla mattina.
                </p>

                <button
                    onClick={advance}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 px-6 rounded-xl transition-colors"
                >
                    ☀️ Procedi alla Mattina
                </button>
            </div>
        </div>
    );
}
