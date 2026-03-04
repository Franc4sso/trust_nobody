import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, selectors } from '@/engine/gameState';
import PageShell from '@/components/PageShell';
import Headline from '@/components/Headline';
import PulpCard from '@/components/PulpCard';
import NeonButton from '@/components/NeonButton';

export default function GameOver() {
    const navigate = useNavigate();
    const { state, dispatch, ACTIONS } = useGame();

    const playNewGame = () => {
        dispatch({ type: ACTIONS.RESET });
        navigate('/');
    };

    const killers = state.players.filter(p => p.role === 'serial_killer');
    const citizens = state.players.filter(p => p.role !== 'serial_killer');
    const killersWon = state.winner === 'killers';

    return (
        <PageShell>
            {/* Victory glow */}
            <div className={`absolute inset-0 pointer-events-none ${
                killersWon
                    ? 'bg-gradient-to-b from-blood/10 via-noir to-noir'
                    : 'bg-gradient-to-b from-taxi/5 via-noir to-noir'
            }`} />

            <div className="p-6 max-w-2xl mx-auto relative z-10">
                <div className="text-center mb-8 animate-fade-in-up">
                    <h1 className={`text-headline text-6xl mb-2 ${
                        killersWon ? 'text-blood glow-red' : 'text-taxi glow-yellow'
                    }`}>
                        {killersWon ? 'IL KILLER HA VINTO' : 'GIUSTIZIA È FATTA'}
                    </h1>
                    <p className="text-quote text-cream/60 text-lg mt-4">
                        {killersWon
                            ? `Erano: ${killers.map(p => p.name).join(', ')}`
                            : 'I Cittadini hanno eliminato tutti i killer!'
                        }
                    </p>
                </div>

                {/* Players reveal */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <PulpCard variant="danger" className="p-5">
                        <h2 className="text-headline text-xl text-blood mb-4">SERIAL KILLER</h2>
                        <div className="space-y-2">
                            {killers.length === 0 ? (
                                <p className="text-cream/40 text-sm">Nessuno</p>
                            ) : (
                                killers.map(player => (
                                    <div key={player.id} className="bg-noir/50 border border-blood/30 p-3 rounded-lg">
                                        <p className="text-ui font-semibold text-cream text-sm">{player.name}</p>
                                        <p className="text-ui text-xs text-cream/40">
                                            {player.is_alive ? 'Vivo' : 'Eliminato'}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </PulpCard>

                    <PulpCard className="p-5" style={{ borderColor: 'var(--color-poison)' }}>
                        <h2 className="text-headline text-xl text-poison mb-4">CITTADINI</h2>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {citizens.length === 0 ? (
                                <p className="text-cream/40 text-sm">Nessuno</p>
                            ) : (
                                citizens.map(player => (
                                    <div key={player.id} className="bg-noir/50 border border-poison/20 p-3 rounded-lg">
                                        <p className="text-ui font-semibold text-cream text-sm">{player.name}</p>
                                        <p className="text-ui text-xs text-cream/40">
                                            {player.role_label} &bull; {player.is_alive ? 'Vivo' : 'Eliminato'}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </PulpCard>
                </div>

                {/* NPCs */}
                <PulpCard variant="info" className="p-5 mb-8">
                    <h2 className="text-headline text-xl text-neon-blue mb-4">NPC</h2>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {(state.npcs || []).map(npc => (
                            <div key={npc.id} className="bg-noir/50 border border-neon-blue/20 p-3 rounded-lg">
                                <p className="text-ui font-semibold text-cream text-sm">{npc.name}</p>
                                <p className="text-ui text-xs text-cream/40">
                                    {npc.is_alive ? 'Vivo' : 'Eliminato'}
                                </p>
                            </div>
                        ))}
                    </div>
                </PulpCard>

                <NeonButton color={killersWon ? 'red' : 'yellow'} onClick={playNewGame}>
                    Nuova Partita
                </NeonButton>
            </div>
        </PageShell>
    );
}
