import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, selectors } from '@/engine/gameState';

export default function GameOver() {
    const navigate = useNavigate();
    const { state, dispatch, ACTIONS } = useGame();

    const playNewGame = () => {
        dispatch({ type: ACTIONS.RESET });
        navigate('/');
    };

    const killers = state.players.filter(p => p.role === 'serial_killer');
    const citizens = state.players.filter(p => p.role !== 'serial_killer');
    const winnerMessage =
        state.winner === 'killers'
            ? `I Killer hanno vinto! Erano: ${killers.map(p => p.name).join(', ')}`
            : 'I Cittadini hanno vinto! Hanno eliminato tutti i killer!';

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <div className="p-6 max-w-2xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-amber-400 mb-4">PARTITA TERMINATA</h1>
                    <p className="text-2xl font-bold" >
                        {state.winner === 'killers' ? (
                            <span className="text-red-400">{winnerMessage}</span>
                        ) : (
                            <span className="text-green-400">{winnerMessage}</span>
                        )}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-red-400 mb-4">Serial Killer</h2>
                        <div className="space-y-2">
                            {killers.length === 0 ? (
                                <p className="text-slate-400">Nessuno</p>
                            ) : (
                                killers.map(player => (
                                    <div key={player.id} className="bg-slate-700 p-3 rounded">
                                        <p className="font-semibold">{player.name}</p>
                                        <p className="text-xs text-slate-400">
                                            {player.is_alive ? 'Vivo' : 'Eliminato'}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-green-400 mb-4">Cittadini</h2>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {citizens.length === 0 ? (
                                <p className="text-slate-400">Nessuno</p>
                            ) : (
                                citizens.map(player => (
                                    <div key={player.id} className="bg-slate-700 p-3 rounded">
                                        <p className="font-semibold">{player.name}</p>
                                        <p className="text-xs text-slate-400">
                                            {player.role_label} • {player.is_alive ? 'Vivo' : 'Eliminato'}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-bold text-blue-400 mb-4">NPC</h2>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {(state.npcs || []).map(npc => (
                            <div key={npc.id} className="bg-slate-700 p-3 rounded">
                                <p className="font-semibold">{npc.name}</p>
                                <p className="text-xs text-slate-400">
                                    {npc.is_alive ? 'Vivo' : 'Eliminato'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={playNewGame}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-black font-bold py-3 px-6 rounded-lg transition"
                >
                    Nuova Partita
                </button>
            </div>
        </div>
    );
}
