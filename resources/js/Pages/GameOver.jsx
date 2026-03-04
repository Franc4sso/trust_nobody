import { router } from '@inertiajs/react';

const roleLabels = {
    serial_killer: 'Serial Killer',
    guardian: 'Guardiano',
    medium: 'Medium',
    analyst: 'Analista',
    citizen: 'Cittadino',
};

const roleColors = {
    serial_killer: 'text-red-400',
    guardian: 'text-blue-400',
    medium: 'text-purple-400',
    analyst: 'text-green-400',
    citizen: 'text-gray-300',
};

export default function GameOver({ game, winner, players, npcs }) {
    const isKillerWin = winner === 'killers';

    return (
        <div className={`min-h-screen ${isKillerWin ? 'bg-red-950' : 'bg-green-950'} text-white`}>
            <div className="p-6 max-w-md mx-auto text-center">
                <div className="text-6xl mb-4">
                    {isKillerWin ? '🔪' : '🎉'}
                </div>

                <h1 className="text-3xl font-bold mb-2">
                    {isKillerWin ? 'I Killer vincono!' : 'I Cittadini vincono!'}
                </h1>

                <p className="text-gray-400 mb-8">
                    {isKillerWin
                        ? 'Tutti gli NPC del villaggio sono stati eliminati.'
                        : 'Tutti i killer sono stati smascherati ed eliminati.'}
                </p>

                {/* Players summary */}
                <div className="bg-black/30 rounded-xl p-4 mb-6 text-left">
                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">
                        Giocatori
                    </h3>
                    {players.map((p) => (
                        <div
                            key={p.id}
                            className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0"
                        >
                            <span className={!p.is_alive ? 'line-through text-gray-500' : ''}>
                                {p.name}
                            </span>
                            <span className={`text-sm font-medium ${roleColors[p.role]}`}>
                                {roleLabels[p.role] || p.role}
                            </span>
                        </div>
                    ))}
                </div>

                {/* NPCs summary */}
                <div className="bg-black/30 rounded-xl p-4 mb-8 text-left">
                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">
                        Abitanti del villaggio
                    </h3>
                    {npcs.map((n) => (
                        <div
                            key={n.id}
                            className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0"
                        >
                            <span className={!n.is_alive ? 'line-through text-gray-500' : ''}>
                                {n.name}
                            </span>
                            <span className="text-sm text-gray-400 capitalize">
                                {n.personality}
                            </span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => router.visit('/')}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
                >
                    Nuova Partita
                </button>
            </div>
        </div>
    );
}
