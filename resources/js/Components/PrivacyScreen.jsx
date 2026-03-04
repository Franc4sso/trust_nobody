import { useState } from 'react';

export default function PrivacyScreen({ children, label }) {
    const [revealed, setRevealed] = useState(false);

    if (revealed) {
        return (
            <div>
                {children}
                <button
                    onClick={() => setRevealed(false)}
                    className="mt-4 text-sm text-gray-400 underline"
                >
                    Nascondi
                </button>
            </div>
        );
    }

    return (
        <div
            className="bg-gray-800 rounded-xl p-8 text-center cursor-pointer border-2 border-dashed border-gray-600"
            onClick={() => setRevealed(true)}
        >
            <div className="text-4xl mb-4">🔒</div>
            <p className="text-gray-400">{label || 'Tocca per rivelare'}</p>
        </div>
    );
}
