import { useState } from 'react';

export default function VoteButtons({ players, onVote, label }) {
    const [selected, setSelected] = useState(null);
    const [confirmed, setConfirmed] = useState(false);

    const handleConfirm = () => {
        if (selected && !confirmed) {
            setConfirmed(true);
            onVote(selected);
        }
    };

    return (
        <div className="space-y-3">
            {players.map((player) => (
                <button
                    key={player.id}
                    onClick={() => !confirmed && setSelected(player)}
                    disabled={confirmed}
                    className={`w-full text-left p-4 rounded-xl transition-colors ${
                        selected?.id === player.id
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-800 text-white hover:bg-gray-700'
                    } ${confirmed ? 'opacity-50' : ''}`}
                >
                    <span className="font-medium">{player.name}</span>
                </button>
            ))}

            {selected && !confirmed && (
                <button
                    onClick={handleConfirm}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl mt-4 transition-colors"
                >
                    {label || `Vota ${selected.name}`}
                </button>
            )}
        </div>
    );
}
