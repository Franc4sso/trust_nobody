import { useState } from 'react';

export default function HotSeatGuard({ playerName, children, message }) {
    const [revealed, setRevealed] = useState(false);

    if (revealed) {
        return children;
    }

    return (
        <div
            className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-white"
            onClick={() => setRevealed(true)}
        >
            <div className="text-center">
                <div className="text-6xl mb-6">📱</div>
                <h2 className="text-2xl font-bold mb-4">
                    Passa il telefono a
                </h2>
                <p className="text-4xl font-bold text-red-400 mb-8">
                    {playerName}
                </p>
                <p className="text-gray-400 text-sm">
                    {message || 'Tocca lo schermo quando sei pronto'}
                </p>
            </div>
        </div>
    );
}
