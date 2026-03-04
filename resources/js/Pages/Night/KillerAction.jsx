import { useState } from 'react';
import { router } from '@inertiajs/react';
import PhaseHeader from '../../Components/PhaseHeader';
import HotSeatGuard from '../../Components/HotSeatGuard';
import NpcCard from '../../Components/NpcCard';

export default function KillerAction({ game, killer, npcs, round }) {
    const [action, setAction] = useState('kill');
    const [selectedNpc, setSelectedNpc] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const submit = () => {
        if (!selectedNpc || submitted) return;
        setSubmitted(true);
        router.post(`/games/${game.id}/night/killer`, {
            player_id: killer.id,
            action,
            target_npc_id: selectedNpc.id,
        });
    };

    return (
        <div className="min-h-screen bg-indigo-950 text-white">
            <PhaseHeader phase="night" round={round} subtitle="Azione del Killer" />

            <div className="p-6 max-w-md mx-auto">
                <HotSeatGuard
                    playerName={killer.name}
                    message="Sei il Serial Killer. Tocca per agire."
                >
                    <div className="mb-6">
                        <p className="text-indigo-300 text-center mb-4">
                            Scegli la tua azione
                        </p>

                        <div className="flex gap-3 mb-6">
                            <button
                                onClick={() => setAction('kill')}
                                className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
                                    action === 'kill'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-gray-800 text-gray-400'
                                }`}
                            >
                                🔪 Uccidi
                            </button>
                            <button
                                onClick={() => setAction('threaten')}
                                className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
                                    action === 'threaten'
                                        ? 'bg-yellow-600 text-white'
                                        : 'bg-gray-800 text-gray-400'
                                }`}
                            >
                                ⚠️ Minaccia
                            </button>
                        </div>

                        <p className="text-sm text-gray-400 text-center mb-4">
                            {action === 'kill'
                                ? 'L\'NPC morirà (se non protetto dal Guardiano)'
                                : 'L\'NPC darà indizi fuorvianti al villaggio'}
                        </p>
                    </div>

                    <div className="space-y-3">
                        {npcs.map((npc) => (
                            <NpcCard
                                key={npc.id}
                                npc={npc}
                                onClick={setSelectedNpc}
                                selected={selectedNpc?.id === npc.id}
                                compact
                            />
                        ))}
                    </div>

                    {selectedNpc && (
                        <button
                            onClick={submit}
                            disabled={submitted}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl mt-6 transition-colors disabled:opacity-50"
                        >
                            {action === 'kill' ? '🔪' : '⚠️'}{' '}
                            {action === 'kill' ? 'Uccidi' : 'Minaccia'}{' '}
                            {selectedNpc.name}
                        </button>
                    )}
                </HotSeatGuard>
            </div>
        </div>
    );
}
