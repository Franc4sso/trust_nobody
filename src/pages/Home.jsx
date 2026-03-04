import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/engine/gameState';

export default function Home() {
    const navigate = useNavigate();
    const { state, dispatch, ACTIONS } = useGame();

    const startNewGame = () => {
        dispatch({ type: ACTIONS.INIT_GAME });
        navigate('/setup/names');
    };

    const continueGame = () => {
        if (state.id) {
            navigate(`/setup/names`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
            </div>

            <div className="relative max-w-md w-full text-center z-10">
                <div className="mb-12">
                    <div className="text-7xl font-black mb-4 leading-tight">
                        <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
                            Trust
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                            Nobody
                        </span>
                    </div>
                    <p className="text-slate-300 text-lg leading-relaxed px-4">
                        Un gioco di deduzione e inganno per <span className="font-bold text-amber-300">4-10 giocatori</span>.
                    </p>
                </div>

                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-500/20 rounded-3xl p-8 space-y-4 shadow-2xl mb-8">
                    <button
                        onClick={startNewGame}
                        className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black font-black py-4 px-6 rounded-2xl transition transform hover:scale-105 hover:shadow-2xl shadow-lg text-lg"
                    >
                        🎮 Nuova Partita
                    </button>

                    {state.id && (
                        <button
                            onClick={continueGame}
                            className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white font-bold py-4 px-6 rounded-2xl transition transform hover:scale-105 shadow-lg text-lg"
                        >
                            ↻ Continua Partita
                        </button>
                    )}
                </div>

                <div className="space-y-4 px-4">
                    <div className="bg-black/50 backdrop-blur border border-amber-500/20 rounded-2xl p-4">
                        <p className="text-slate-300 text-sm leading-relaxed">
                            <span className="text-red-400 font-bold">🔴 Serial Killer:</span> Ti aggiri tra gli NPC. Elimina i cittadini per vincere.
                        </p>
                    </div>
                    <div className="bg-black/50 backdrop-blur border border-amber-500/20 rounded-2xl p-4">
                        <p className="text-slate-300 text-sm leading-relaxed">
                            <span className="text-green-400 font-bold">🟢 Cittadini:</span> Trovate e votate il killer prima che sia troppo tardi.
                        </p>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-700">
                    <p className="text-slate-500 text-xs uppercase tracking-widest">Master di partita</p>
                    <p className="text-slate-400 text-sm mt-2">
                        Il telefono rimane con il master durante tutto il gioco. Loro controllano le fasi e rivelano le informazioni.
                    </p>
                </div>
            </div>
        </div>
    );
}
