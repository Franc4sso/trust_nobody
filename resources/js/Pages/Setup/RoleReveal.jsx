import { useState } from 'react';
import { router } from '@inertiajs/react';
import PhaseHeader from '../../Components/PhaseHeader';
import HotSeatGuard from '../../Components/HotSeatGuard';
import PrivacyScreen from '../../Components/PrivacyScreen';

const roleColors = {
    serial_killer: 'text-red-400',
    guardian: 'text-blue-400',
    medium: 'text-purple-400',
    analyst: 'text-green-400',
    citizen: 'text-gray-300',
};

const roleEmoji = {
    serial_killer: '🔪',
    guardian: '🛡️',
    medium: '👁️',
    analyst: '🔍',
    citizen: '👤',
};

export default function RoleReveal({ game, players }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [revealed, setRevealed] = useState(false);

    const player = players[currentIndex];
    const isLast = currentIndex === players.length - 1;

    const next = () => {
        if (isLast) {
            router.post(`/games/${game.id}/advance`);
        } else {
            setCurrentIndex(currentIndex + 1);
            setRevealed(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <PhaseHeader
                phase="role_reveal"
                subtitle={`${currentIndex + 1} di ${players.length}`}
            />

            <div className="p-6 max-w-md mx-auto">
                <HotSeatGuard playerName={player.name}>
                    <div className="text-center py-8">
                        <h2 className="text-2xl font-bold mb-6">
                            {player.name}
                        </h2>

                        <PrivacyScreen label="Tocca per vedere il tuo ruolo">
                            <div className="text-center py-4">
                                <div className="text-6xl mb-4">
                                    {roleEmoji[player.role]}
                                </div>
                                <h3
                                    className={`text-3xl font-bold mb-2 ${roleColors[player.role]}`}
                                >
                                    {player.role_label}
                                </h3>
                                <p className="text-gray-400 mt-4 text-sm leading-relaxed">
                                    {player.role_description}
                                </p>
                            </div>
                        </PrivacyScreen>

                        <button
                            onClick={next}
                            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-xl mt-8 transition-colors"
                        >
                            {isLast ? 'Inizia la partita' : 'Prossimo giocatore'}
                        </button>
                    </div>
                </HotSeatGuard>
            </div>
        </div>
    );
}
