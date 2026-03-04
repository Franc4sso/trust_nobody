import { useState } from 'react';
import { router } from '@inertiajs/react';
import PhaseHeader from '../../Components/PhaseHeader';

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

const personalityTitle = {
    librarian: 'Bibliotecaria',
    merchant: 'Mercante',
    herbalist: 'Erborista',
    astronomer: 'Astronomo',
    blacksmith: 'Fabbra',
    innkeeper: 'Locandiere',
    weaver: 'Tessitrice',
    hunter: 'Cacciatore',
    healer: 'Guaritrice',
    elder: 'Anziano',
};

export default function NpcIntroductions({ game, npcs }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const isLast = currentIndex === npcs.length - 1;
    const npc = npcs[currentIndex];
    const emoji = personalityEmoji[npc.personality] || '👤';
    const title = personalityTitle[npc.personality] || npc.personality;

    const next = () => {
        if (isLast) {
            router.post(`/games/${game.id}/advance`);
        } else {
            setCurrentIndex(currentIndex + 1);
        }
    };

    return (
        <div className="min-h-screen bg-indigo-950 text-white">
            <PhaseHeader
                phase="n1_intro"
                subtitle={`Abitante ${currentIndex + 1} di ${npcs.length}`}
            />

            <div className="p-6 max-w-md mx-auto">
                <div className="text-center mb-6">
                    <p className="text-indigo-300 text-sm">
                        Conosci gli abitanti del villaggio...
                    </p>
                </div>

                <div className="p-5 rounded-xl border border-indigo-700 bg-indigo-900/50">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">{emoji}</span>
                        <div>
                            <h3 className="font-bold text-xl text-white">{npc.name}</h3>
                            <p className="text-sm text-indigo-300">{title}</p>
                        </div>
                    </div>

                    <div className="border-t border-indigo-700 pt-3 space-y-3">
                        {npc.connection_descriptions.map((desc, i) => (
                            <p
                                key={i}
                                className="text-sm text-indigo-200 italic leading-relaxed"
                            >
                                "{desc}"
                            </p>
                        ))}
                    </div>
                </div>

                <button
                    onClick={next}
                    className="w-full bg-indigo-700 hover:bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl mt-6 transition-colors"
                >
                    {isLast ? 'Procedi al primo voto' : 'Prossimo abitante'}
                </button>
            </div>
        </div>
    );
}
