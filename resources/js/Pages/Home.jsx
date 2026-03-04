import { router } from '@inertiajs/react';

export default function Home() {
    const startGame = () => {
        router.post('/games');
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-white">
            <h1 className="text-5xl font-bold mb-4 tracking-tight">Trust Nobody</h1>
            <p className="text-gray-400 text-center mb-8 max-w-sm">
                Un gioco di deduzione sociale. Trova i killer tra voi... prima che sia troppo tardi.
            </p>
            <button
                onClick={startGame}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-colors active:scale-95"
            >
                Nuova Partita
            </button>
        </div>
    );
}
