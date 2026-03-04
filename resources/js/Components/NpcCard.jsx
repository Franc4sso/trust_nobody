export default function NpcCard({ npc, onClick, selected, compact }) {
    const personalityEmoji = {
        librarian: '📚',
        merchant: '💰',
        herbalist: '🌿',
        astronomer: '🔭',
        blacksmith: '⚒️',
        innkeeper: '🍺',
        weaver: '🧵',
        hunter: '🏹',
        healer: '💊',
        elder: '👴',
    };

    const emoji = personalityEmoji[npc.personality] || '👤';

    if (compact) {
        return (
            <button
                onClick={() => onClick?.(npc)}
                className={`p-3 rounded-xl transition-colors ${
                    selected
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                } ${!onClick ? 'cursor-default' : 'cursor-pointer'}`}
            >
                <span className="mr-2">{emoji}</span>
                <span className="font-medium">{npc.name}</span>
                {npc.is_alive === false && (
                    <span className="text-red-400 ml-2 text-sm">✖</span>
                )}
            </button>
        );
    }

    return (
        <div
            onClick={() => onClick?.(npc)}
            className={`p-4 rounded-xl border transition-colors ${
                selected
                    ? 'border-red-500 bg-red-900/30'
                    : 'border-gray-700 bg-gray-800'
            } ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{emoji}</span>
                <div>
                    <h3 className="font-bold text-white">{npc.name}</h3>
                    <p className="text-sm text-gray-400 capitalize">{npc.personality}</p>
                </div>
            </div>
            {npc.backstory && (
                <p className="text-sm text-gray-300 mt-2">{npc.backstory}</p>
            )}
            {npc.is_threatened && (
                <p className="text-xs text-yellow-400 mt-2">⚠️ Minacciato</p>
            )}
        </div>
    );
}
