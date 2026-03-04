import { router } from '@inertiajs/react';
import PhaseHeader from '../../Components/PhaseHeader';

const roleLabels = {
    serial_killer: 'Serial Killer',
    guardian: 'Guardiano',
    medium: 'Medium',
    analyst: 'Analista',
    citizen: 'Cittadino',
};

export default function VoteResult({ game, result, isN1, isRunoff, needsRunoff, round }) {
    const advance = () => {
        if (needsRunoff) {
            // Reload vote page which will now be in runoff mode
            router.visit(`/games/${game.id}/vote`);
        } else {
            router.post(`/games/${game.id}/advance`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <PhaseHeader
                phase="vote"
                round={round}
                subtitle={isN1 ? 'Risultato primo voto' : 'Risultato votazione'}
            />

            <div className="p-6 max-w-md mx-auto">
                {/* Vote counts */}
                {result.counts && (
                    <div className="bg-gray-800 rounded-xl p-4 mb-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">
                            Risultati
                        </h3>
                        {Array.isArray(result.counts) ? (
                            result.counts.map((item, i) => (
                                <div key={i} className="flex justify-between py-2 border-b border-gray-700 last:border-0">
                                    <span>{item.name}</span>
                                    <span className="font-bold text-red-400">
                                        {item.votes} {item.votes === 1 ? 'voto' : 'voti'}
                                    </span>
                                </div>
                            ))
                        ) : (
                            Object.entries(result.counts).map(([playerId, count]) => (
                                <div key={playerId} className="flex justify-between py-2 border-b border-gray-700 last:border-0">
                                    <span>Giocatore #{playerId}</span>
                                    <span className="font-bold text-red-400">
                                        {count} {count === 1 ? 'voto' : 'voti'}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* N1 result - no elimination */}
                {isN1 && (
                    <div className="bg-gray-800 rounded-xl p-6 mb-6 text-center">
                        <p className="text-gray-300">
                            Il primo voto è servito per saggiare i sospetti.
                            Nessuno viene eliminato questa volta.
                        </p>
                    </div>
                )}

                {/* Runoff needed */}
                {needsRunoff && result.runoff_players && (
                    <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-6 mb-6 text-center">
                        <div className="text-3xl mb-3">⚖️</div>
                        <h3 className="text-xl font-bold text-yellow-400 mb-2">
                            Pareggio!
                        </h3>
                        <p className="text-gray-300 mb-3">
                            Ballottaggio tra:
                        </p>
                        <div className="flex justify-center gap-3">
                            {result.runoff_players.map((p) => (
                                <span key={p.id} className="bg-yellow-800/50 px-4 py-2 rounded-lg font-bold">
                                    {p.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Elimination */}
                {!isN1 && !needsRunoff && result.eliminated && (
                    <div className="bg-red-900/30 border border-red-800 rounded-xl p-6 mb-6 text-center">
                        <div className="text-3xl mb-3">⚰️</div>
                        <h3 className="text-xl font-bold text-red-400 mb-1">
                            {result.eliminated.name}
                        </h3>
                        <p className="text-gray-400">è stato eliminato</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Era un <strong>{roleLabels[result.eliminated.role] || result.eliminated.role}</strong>
                        </p>
                    </div>
                )}

                <button
                    onClick={advance}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
                >
                    {needsRunoff ? 'Procedi al ballottaggio' : 'Continua'}
                </button>
            </div>
        </div>
    );
}
