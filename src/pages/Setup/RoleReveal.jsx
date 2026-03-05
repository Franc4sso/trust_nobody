import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, selectors } from '@/engine/gameState';
import PageShell from '@/components/PageShell';
import Headline from '@/components/Headline';
import PulpCard from '@/components/PulpCard';
import NeonButton from '@/components/NeonButton';

const roleStyles = {
    serial_killer: { color: 'text-blood', glow: 'glow-red', border: 'border-blood', btnColor: 'red' },
    guardian: { color: 'text-poison', glow: 'glow-green', border: 'border-poison', btnColor: 'green' },
    medium: { color: 'text-morphine', glow: 'glow-purple', border: 'border-morphine', btnColor: 'pink' },
    analyst: { color: 'text-neon-blue', glow: 'glow-blue', border: 'border-neon-blue', btnColor: 'blue' },
    citizen: { color: 'text-cream', glow: '', border: 'border-tobacco', btnColor: 'yellow' },
};

export default function RoleReveal() {
    const navigate = useNavigate();
    const { state, dispatch, ACTIONS } = useGame();

    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const alivePlayers = selectors.alivePlayers(state);

    const player = alivePlayers[currentPlayerIndex];
    const style = roleStyles[player?.role] || roleStyles.citizen;
    const neutralStyle = { color: 'text-cream', glow: '', border: 'border-tobacco', btnColor: 'yellow' };

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
                    <PulpCard variant="vintage" className="text-center space-y-6 relative stamp-confidential animate-fade-in-up">
                        {/* Player name — neutral colors until role is revealed */}
                        <div className={`border-2 ${revealed ? style.border : neutralStyle.border} rounded-lg p-5 bg-noir/50`}>
                            <h2 className={`text-headline text-4xl ${revealed ? style.color : neutralStyle.color}`}>{player.name}</h2>
                        </div>

                        {!revealed ? (
                            <div className="space-y-4 py-6">
                                <div className="text-headline text-6xl text-tobacco">?</div>
                                <p className="text-quote text-cream/60 text-lg">Pronto a scoprire il tuo ruolo?</p>
                                <NeonButton color="yellow" onClick={() => setRevealed(true)}>
                                    Rivela Ruolo
                                </NeonButton>
                            </div>
                        ) : (
                            <div className="space-y-6 py-4 animate-fade-in-up">
                                <div className={`border-2 ${style.border} rounded-lg p-6 bg-noir/60`}>
                                    <p className="text-ui text-cream/40 text-xs uppercase tracking-widest mb-3">Il tuo ruolo è</p>
                                    <p className={`text-headline text-5xl ${style.color} ${style.glow}`}>
                                        {player.role_label}
                                    </p>
                                </div>

                                <div className="card-pulp p-5 min-h-20">
                                    <p className="text-cream/80 text-sm leading-relaxed">
                                        {player.role_description}
                                    </p>
                                </div>

                                <NeonButton color={style.btnColor} onClick={nextPlayer}>
                                    {currentPlayerIndex < alivePlayers.length - 1
                                        ? 'Giocatore Successivo'
                                        : 'Inizia Partita'}
                                </NeonButton>
                            </div>
                        )}
                    </PulpCard>
                )}

                {/* Progress: fascicoli */}
                <div className="mt-8 flex gap-2 justify-center flex-wrap">
                    {alivePlayers.map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                i < currentPlayerIndex
                                    ? 'w-8 bg-poison'
                                    : i === currentPlayerIndex
                                    ? 'w-8 bg-taxi animate-spotlight'
                                    : 'w-3 bg-asphalt'
                            }`}
                        ></div>
                    ))}
                </div>
            </div>
        </PageShell>
    );
}
