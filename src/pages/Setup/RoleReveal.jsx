import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, selectors } from '@/engine/gameState';
import { motion } from 'framer-motion';
import PageShell from '@/components/PageShell';
import Headline from '@/components/Headline';
import RoleCard from '@/components/RoleCard';

export default function RoleReveal() {
    const navigate = useNavigate();
    const { state, dispatch, ACTIONS } = useGame();

    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const alivePlayers = selectors.alivePlayers(state);

    const player = alivePlayers[currentPlayerIndex];

    const nextPlayer = () => {
        if (currentPlayerIndex < alivePlayers.length - 1) {
            setCurrentPlayerIndex(currentPlayerIndex + 1);
            setRevealed(false);
        } else {
            dispatch({
                type: ACTIONS.SET_PHASE_AND_ROUND,
                payload: { phase: 'n1_intro' },
            });
            navigate('/n1/intro');
        }
    };

    return (
        <PageShell className="flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                <Headline glow="yellow" subtitle={`${alivePlayers.length - currentPlayerIndex} fascicoli rimangono`}>
                    RIVELAZIONE RUOLI
                </Headline>

                {player && (
                    <motion.div
                        key={currentPlayerIndex}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <RoleCard
                            player={player}
                            revealed={revealed}
                            onReveal={() => setRevealed(true)}
                            onNext={nextPlayer}
                            isLast={currentPlayerIndex >= alivePlayers.length - 1}
                        />
                    </motion.div>
                )}

                {/* Progress dots */}
                <div className="mt-8 flex gap-2 justify-center flex-wrap">
                    {alivePlayers.map((_, i) => (
                        <motion.div
                            key={i}
                            layout
                            className={`h-1.5 rounded-full transition-colors duration-300 ${
                                i < currentPlayerIndex
                                    ? 'w-6 bg-poison'
                                    : i === currentPlayerIndex
                                    ? 'w-8 bg-taxi'
                                    : 'w-3 bg-tobacco'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </PageShell>
    );
}
