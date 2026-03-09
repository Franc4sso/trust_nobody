import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '@/engine/gameState';
import { Skull, Users, User } from 'lucide-react';
import { roleIcons } from '@/components/RoleCard';
import PageShell from '@/components/PageShell';
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
                    ? 'bg-gradient-to-b from-blood/8 via-noir to-noir'
                    : 'bg-gradient-to-b from-taxi/4 via-noir to-noir'
            }`} />

            <div className="p-6 max-w-2xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="text-center mb-8"
                >
                    <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                        style={{ backgroundColor: killersWon ? 'rgba(212,54,75,0.1)' : 'rgba(212,168,67,0.1)' }}
                    >
                        {killersWon
                            ? <Skull size={36} color="#d4364b" strokeWidth={1.5} />
                            : <Users size={36} color="#d4a843" strokeWidth={1.5} />
                        }
                    </div>
                    <h1 className={`text-headline text-5xl mb-2 ${
                        killersWon ? 'text-blood glow-red' : 'text-taxi glow-yellow'
                    }`}>
                        {killersWon ? 'IL KILLER HA VINTO' : 'GIUSTIZIA E\' FATTA'}
                    </h1>
                    <p className="text-quote text-cream/50 text-lg mt-4">
                        {killersWon
                            ? `Erano: ${killers.map(p => p.name).join(', ')}`
                            : 'I Cittadini hanno eliminato tutti i killer!'
                        }
                    </p>
                </motion.div>

                {/* Players reveal */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <PulpCard variant="danger" className="p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Skull size={18} color="#d4364b" strokeWidth={1.5} />
                                <h2 className="text-headline text-xl text-blood">SERIAL KILLER</h2>
                            </div>
                            <div className="space-y-2">
                                {killers.map((player, i) => (
                                    <motion.div
                                        key={player.id}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + i * 0.08 }}
                                        className="bg-noir/40 border border-blood/20 p-3 rounded-lg"
                                    >
                                        <p className="text-ui font-semibold text-cream text-sm">{player.name}</p>
                                        <p className="text-ui text-xs text-cream/40">
                                            {player.is_alive ? 'Vivo' : 'Eliminato'}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </PulpCard>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <PulpCard className="p-5" style={{ borderColor: 'rgba(62,207,142,0.3)' }}>
                            <div className="flex items-center gap-2 mb-4">
                                <Users size={18} color="#3ecf8e" strokeWidth={1.5} />
                                <h2 className="text-headline text-xl text-poison">CITTADINI</h2>
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {citizens.map((player, i) => {
                                    const Icon = roleIcons[player.role] || User;
                                    return (
                                        <motion.div
                                            key={player.id}
                                            initial={{ opacity: 0, x: 8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + i * 0.06 }}
                                            className="bg-noir/40 border border-poison/15 p-3 rounded-lg flex items-center gap-3"
                                        >
                                            <Icon size={14} className="text-cream/30 flex-shrink-0" strokeWidth={1.5} />
                                            <div>
                                                <p className="text-ui font-semibold text-cream text-sm">{player.name}</p>
                                                <p className="text-ui text-xs text-cream/40">
                                                    {player.role_label} &bull; {player.is_alive ? 'Vivo' : 'Eliminato'}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </PulpCard>
                    </motion.div>
                </div>

                {/* NPCs */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <PulpCard variant="info" className="p-5 mb-8">
                        <h2 className="text-headline text-xl text-neon-blue mb-4">NPC</h2>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {(state.npcs || []).map(npc => (
                                <div key={npc.id} className="bg-noir/40 border border-neon-blue/15 p-3 rounded-lg">
                                    <p className="text-ui font-semibold text-cream text-sm">{npc.name}</p>
                                    <p className="text-ui text-xs text-cream/40">
                                        {npc.is_alive ? 'Vivo' : 'Eliminato'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </PulpCard>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <NeonButton color={killersWon ? 'red' : 'yellow'} onClick={playNewGame}>
                        Nuova Partita
                    </NeonButton>
                </motion.div>
            </div>
        </PageShell>
    );
}
