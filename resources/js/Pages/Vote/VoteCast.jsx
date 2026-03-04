import { router } from '@inertiajs/react';
import PhaseHeader from '../../Components/PhaseHeader';
import HotSeatGuard from '../../Components/HotSeatGuard';
import VoteButtons from '../../Components/VoteButtons';

export default function VoteCast({ game, currentVoter, players, isRunoff, round }) {
    const handleVote = (target) => {
        router.post(`/games/${game.id}/vote`, {
            voter_id: currentVoter.id,
            target_id: target.id,
        });
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <PhaseHeader
                phase="vote"
                round={round}
                subtitle={isRunoff ? 'Ballottaggio' : 'Chi eliminare?'}
            />

            <div className="p-6 max-w-md mx-auto">
                <HotSeatGuard
                    playerName={currentVoter.name}
                    message="Tocca quando sei pronto a votare"
                >
                    <div className="mb-6 text-center">
                        <p className="text-gray-400">
                            {isRunoff
                                ? 'Ballottaggio! Scegli tra i candidati.'
                                : 'Chi vuoi eliminare?'}
                        </p>
                    </div>

                    <VoteButtons
                        players={players}
                        onVote={handleVote}
                        label="Conferma voto"
                    />
                </HotSeatGuard>
            </div>
        </div>
    );
}
