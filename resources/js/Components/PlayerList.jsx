export default function PlayerList({ players, onSelect, selectedId, showRole }) {
    return (
        <div className="space-y-2">
            {players.map((player) => (
                <button
                    key={player.id}
                    onClick={() => onSelect?.(player)}
                    className={`w-full text-left p-4 rounded-xl transition-colors ${
                        selectedId === player.id
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-800 text-white hover:bg-gray-700'
                    } ${!onSelect ? 'cursor-default' : 'cursor-pointer'}`}
                >
                    <span className="font-medium">{player.name}</span>
                    {showRole && player.role && (
                        <span className="text-sm text-gray-400 ml-2">
                            ({player.role})
                        </span>
                    )}
                    {player.is_alive === false && (
                        <span className="text-sm text-red-400 ml-2">✖ Eliminato</span>
                    )}
                </button>
            ))}
        </div>
    );
}
