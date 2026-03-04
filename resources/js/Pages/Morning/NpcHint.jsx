import { router } from '@inertiajs/react';
import PhaseHeader from '../../Components/PhaseHeader';

export default function NpcHint({ game, hints, nightSummary, aliveNpcs, round }) {
    const advance = () => {
        router.post(`/games/${game.id}/advance`);
    };

    return (
        <div className="min-h-screen bg-amber-50 text-gray-900">
            <PhaseHeader phase="morning" round={round} />

            <div className="p-6 max-w-md mx-auto">
                {/* Night outcome announcement */}
                {nightSummary && (
                    <div className="bg-white rounded-xl p-4 mb-6 border border-amber-200 shadow-sm">
                        {nightSummary.action === 'kill' && !nightSummary.blocked && (
                            <p className="text-red-600 font-medium">
                                ☠️ Questa notte <strong>{nightSummary.target_name}</strong> è stato trovato morto.
                            </p>
                        )}
                        {nightSummary.action === 'kill' && nightSummary.blocked && (
                            <p className="text-green-600 font-medium">
                                🛡️ Qualcuno è stato attaccato nella notte, ma è stato protetto! Tutti gli NPC sono al sicuro.
                            </p>
                        )}
                        {nightSummary.action === 'threaten' && (
                            <p className="text-amber-600 font-medium">
                                La notte è passata senza vittime... ma qualcosa nell'aria è cambiato.
                            </p>
                        )}
                    </div>
                )}

                {/* NPC Hints */}
                {hints.map((hint, i) => (
                    <div
                        key={i}
                        className={`rounded-xl p-4 mb-4 border shadow-sm ${
                            hint.is_analyst_bonus
                                ? 'bg-green-50 border-green-200'
                                : hint.is_threatened
                                ? 'bg-yellow-50 border-yellow-200'
                                : 'bg-white border-amber-200'
                        }`}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-gray-800">
                                {hint.npc_name}
                            </span>
                            <span className="text-sm text-gray-500 capitalize">
                                ({hint.npc_personality})
                            </span>
                            {hint.is_analyst_bonus && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                    Bonus Analista
                                </span>
                            )}
                        </div>
                        <p className="text-gray-700 italic">"{hint.text}"</p>
                    </div>
                ))}

                {hints.length === 0 && (
                    <div className="bg-white rounded-xl p-4 mb-4 border border-amber-200 text-center">
                        <p className="text-gray-500">
                            Nessun NPC ha qualcosa da dire questa mattina.
                        </p>
                    </div>
                )}

                {/* Alive NPCs status */}
                <div className="mt-6 mb-6">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">
                        NPC in vita
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {aliveNpcs.map((npc) => (
                            <span
                                key={npc.id}
                                className={`text-sm px-3 py-1 rounded-full ${
                                    npc.is_threatened
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-gray-100 text-gray-700'
                                }`}
                            >
                                {npc.name}
                            </span>
                        ))}
                    </div>
                </div>

                <button
                    onClick={advance}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 px-6 rounded-xl transition-colors"
                >
                    Procedi alla Discussione
                </button>
            </div>
        </div>
    );
}
