import { router } from '@inertiajs/react';
import PhaseHeader from '../../Components/PhaseHeader';
import HotSeatGuard from '../../Components/HotSeatGuard';
import PrivacyScreen from '../../Components/PrivacyScreen';

export default function MediumReveal({ game, medium, eliminated, round }) {
    const advance = () => {
        router.post(`/games/${game.id}/advance`);
    };

    if (!medium || !eliminated) {
        return (
            <div className="min-h-screen bg-purple-950 text-white flex items-center justify-center">
                <button onClick={advance} className="bg-purple-700 px-6 py-3 rounded-xl">
                    Continua
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-purple-950 text-white">
            <PhaseHeader phase="medium_reveal" round={round} />

            <div className="p-6 max-w-md mx-auto">
                <HotSeatGuard
                    playerName={medium.name}
                    message="Sei il Medium. Tocca per avere la tua visione."
                >
                    <div className="text-center mb-6">
                        <div className="text-5xl mb-4">👁️</div>
                        <p className="text-purple-300">
                            Una visione ti rivela qualcosa su{' '}
                            <strong>{eliminated.name}</strong>...
                        </p>
                    </div>

                    <PrivacyScreen label="Tocca per avere la visione">
                        <div className="text-center py-4">
                            <p className="text-lg text-gray-300 mb-2">
                                {eliminated.name}...
                            </p>
                            {eliminated.was_killer ? (
                                <p className="text-3xl font-bold text-red-400">
                                    ERA IL KILLER!
                                </p>
                            ) : (
                                <p className="text-3xl font-bold text-green-400">
                                    NON era il Killer
                                </p>
                            )}
                        </div>
                    </PrivacyScreen>

                    <button
                        onClick={advance}
                        className="w-full bg-purple-700 hover:bg-purple-600 text-white font-bold py-4 px-6 rounded-xl mt-8 transition-colors"
                    >
                        Continua
                    </button>
                </HotSeatGuard>
            </div>
        </div>
    );
}
