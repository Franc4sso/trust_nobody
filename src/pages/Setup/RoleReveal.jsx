import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, selectors } from '@/engine/gameState';

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
            // All roles revealed, advance to N1
            dispatch({
                type: ACTIONS.SET_PHASE_AND_ROUND,
                payload: { phase: 'n1_intro' },
            });
            navigate('/n1/intro');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent mb-2">
                        Rivelazione Ruoli
                    </h1>
                    <p className="text-amber-300 font-semibold">
                        {alivePlayers.length - currentPlayerIndex} giocatori rimangono
                    </p>
                </div>

                {player && (
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-amber-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
                        {/* Player Name */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-2xl blur opacity-30"></div>
                            <div className="relative bg-slate-900 rounded-2xl p-6 border-2 border-amber-500">
                                <h2 className="text-3xl font-black text-amber-300">{player.name}</h2>
                            </div>
                        </div>

                        {/* Hidden/Revealed State */}
                        {!revealed ? (
                            <div className="space-y-4 py-8">
                                <div className="text-6xl">🔒</div>
                                <p className="text-slate-300 text-lg font-semibold">Pronto a scoprire il tuo ruolo?</p>
                                <button
                                    onClick={() => setRevealed(true)}
                                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black font-black py-4 px-6 rounded-xl transition transform hover:scale-105 text-lg"
                                >
                                    Rivela Ruolo
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6 py-6 animate-in fade-in duration-500">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-amber-500/20 rounded-xl blur-lg"></div>
                                    <div className="relative bg-black/40 rounded-xl p-6 border-2 border-amber-400">
                                        <p className="text-slate-300 text-xs font-bold tracking-widest uppercase mb-3">Il tuo ruolo è</p>
                                        <p className="text-4xl font-black text-amber-300">{player.role_label}</p>
                                    </div>
                                </div>

                                <div className="bg-black/40 rounded-xl p-5 border border-amber-400/30 min-h-24">
                                    <p className="text-slate-200 text-sm leading-relaxed">
                                        {player.role_description}
                                    </p>
                                </div>

                                <button
                                    onClick={nextPlayer}
                                    className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-black font-black py-4 px-6 rounded-xl transition transform hover:scale-105 text-lg"
                                >
                                    {currentPlayerIndex < alivePlayers.length - 1
                                        ? '→ Giocatore Successivo'
                                        : '✓ Inizia Partita'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Progress indicator */}
                <div className="mt-8 flex gap-2 justify-center flex-wrap">
                    {alivePlayers.map((_, i) => (
                        <div
                            key={i}
                            className={`h-3 rounded-full transition-all ${
                                i < currentPlayerIndex
                                    ? 'w-8 bg-green-500'
                                    : i === currentPlayerIndex
                                    ? 'w-8 bg-amber-400'
                                    : 'w-3 bg-slate-600'
                            }`}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
