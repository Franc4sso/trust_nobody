import { router } from '@inertiajs/react';
import PhaseHeader from '../../Components/PhaseHeader';

export default function Discussion({ game, players, aliveNpcs, round }) {
    const advance = () => {
        router.post(`/games/${game.id}/advance`);
    };

    return (
        <div className="min-h-screen bg-amber-50 text-gray-900">
            <PhaseHeader phase="day" round={round} subtitle="Fase di discussione" />

            <div className="p-6 max-w-md mx-auto">
                <div className="bg-white rounded-xl p-6 mb-6 border border-amber-200 shadow-sm text-center">
                    <div className="text-5xl mb-4">💬</div>
                    <h2 className="text-xl font-bold mb-2">Discutete tra voi!</h2>
                    <p className="text-gray-600 text-sm">
                        Analizzate gli indizi, accusate i sospetti, difendetevi.
                        Quando siete pronti, procedete al voto.
                    </p>
                </div>

                <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">
                        Giocatori in vita
                    </h3>
                    <div className="space-y-2">
                        {players.map((p) => (
                            <div
                                key={p.id}
                                className="bg-white rounded-lg p-3 border border-gray-200"
                            >
                                {p.name}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">
                        NPC in vita
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {aliveNpcs.map((npc) => (
                            <span
                                key={npc.id}
                                className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700"
                            >
                                {npc.name}
                            </span>
                        ))}
                    </div>
                </div>

                <button
                    onClick={advance}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition-colors"
                >
                    Procedi al Voto
                </button>
            </div>
        </div>
    );
}
