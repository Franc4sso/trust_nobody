import { useState } from 'react';
import { router } from '@inertiajs/react';
import PhaseHeader from '../../Components/PhaseHeader';
import HotSeatGuard from '../../Components/HotSeatGuard';
import NpcCard from '../../Components/NpcCard';

export default function GuardianAction({ game, guardian, npcs, round }) {
    const [selectedNpc, setSelectedNpc] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const submit = () => {
        if (!selectedNpc || submitted) return;
        setSubmitted(true);
        router.post(`/games/${game.id}/night/guardian`, {
            player_id: guardian.id,
            target_npc_id: selectedNpc.id,
        });
    };

    return (
        <div className="min-h-screen bg-indigo-950 text-white">
            <PhaseHeader phase="night" round={round} subtitle="Azione del Guardiano" />

            <div className="p-6 max-w-md mx-auto">
                <HotSeatGuard
                    playerName={guardian.name}
                    message="Sei il Guardiano. Tocca per proteggere."
                >
                    <div className="mb-6 text-center">
                        <p className="text-blue-300">
                            Scegli un NPC da proteggere questa notte
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                            Se il killer attacca questo NPC, lo salverai
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
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl mt-6 transition-colors disabled:opacity-50"
                        >
                            🛡️ Proteggi {selectedNpc.name}
                        </button>
                    )}
                </HotSeatGuard>
            </div>
        </div>
    );
}
