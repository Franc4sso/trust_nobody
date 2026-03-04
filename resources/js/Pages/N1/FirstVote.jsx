import { router } from '@inertiajs/react';
import PhaseHeader from '../../Components/PhaseHeader';
import HotSeatGuard from '../../Components/HotSeatGuard';
import VoteButtons from '../../Components/VoteButtons';

export default function FirstVote({ game, currentVoter, players }) {
    const handleVote = (target) => {
        router.post(`/games/${game.id}/n1/vote`, {
            voter_id: currentVoter.id,
            target_id: target.id,
        });
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <PhaseHeader phase="n1_vote" subtitle="Primo voto di sospetto" />

            <div className="p-6 max-w-md mx-auto">
                <HotSeatGuard
                    playerName={currentVoter.name}
                    message="Tocca quando sei pronto a votare"
                >
                    <div className="mb-6 text-center">
                        <p className="text-gray-400 mb-2">
                            Chi ti sembra sospetto?
                        </p>
                        <p className="text-xs text-gray-500">
                            Questo voto non elimina nessuno
                        </p>
                    </div>

                    <VoteButtons
                        players={players}
                        onVote={handleVote}
                        label="Conferma sospetto"
                    />
                </HotSeatGuard>
            </div>
        </div>
    );
}
