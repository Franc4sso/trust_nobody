import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame, selectors } from '@/engine/gameState';
import { ChevronDown, ChevronUp, Skull, Quote } from 'lucide-react';
import PageShell from '@/components/PageShell';
import Headline from '@/components/Headline';
import PulpCard from '@/components/PulpCard';
import NeonButton from '@/components/NeonButton';
import SuspectDossier from '@/components/SuspectDossier';

function NpcProfilesPanel({ npcs, players }) {
    const [open, setOpen] = useState(false);
    const [expandedNpc, setExpandedNpc] = useState(null);

    if (!npcs || npcs.length === 0) return null;

    return (
        <PulpCard variant="vintage" className="mb-6 p-0 overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
            >
                <span className="text-headline text-lg text-taxi tracking-wider">
                    FASCICOLI TESTIMONI
                </span>
                <div className="flex items-center gap-2 text-cream/40 text-sm text-ui">
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    <span>({npcs.length})</span>
                </div>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-6 space-y-3">
                            {npcs.map(npc => (
                                <div key={npc.id} className="bg-noir/40 border border-tobacco/20 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setExpandedNpc(expandedNpc === npc.id ? null : npc.id)}
                                        className="w-full flex items-center justify-between px-4 py-3 text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-full border border-taxi/30 bg-surface-2 flex items-center justify-center flex-shrink-0">
                                                <span className="text-headline text-xs text-taxi">{npc.name.charAt(0)}</span>
                                            </div>
                                            <span className="text-headline text-sm text-cream">{npc.name}</span>
                                            {!npc.is_alive && (
                                                <span className="text-headline text-xs text-blood border border-blood/30 px-2 py-0.5 rounded">
                                                    VITTIMA
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-cream/30">
                                            {expandedNpc === npc.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </span>
                                    </button>

                                    <AnimatePresence>
                                        {expandedNpc === npc.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-4 pb-4 space-y-2 border-t border-tobacco/15">
                                                    <p className="text-ui text-xs text-cream/30 uppercase tracking-widest pt-3 mb-3">
                                                        Dichiarazioni
                                                    </p>
                                                    {(npc.connection_descriptions || []).map((conn, i) => {
                                                        const player = players.find(p => p.id === conn.player_id);
                                                        return (
                                                            <div key={i} className="flex gap-3 items-start">
                                                                <span className="text-taxi text-xs text-headline flex-shrink-0 pt-0.5 w-20 truncate">
                                                                    {player?.name ?? '???'}
                                                                </span>
                                                                <p className="text-quote text-sm text-cream/60 italic leading-snug">
                                                                    &ldquo;{conn.text}&rdquo;
                                                                </p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PulpCard>
    );
}

export default function Discussion() {
    const navigate = useNavigate();
    const { state, dispatch, ACTIONS } = useGame();

    const continueToVote = () => {
        dispatch({
            type: ACTIONS.SET_PHASE_AND_ROUND,
            payload: { phase: 'vote' },
        });
        navigate('/vote/panel');
    };

    const alivePlayers = selectors.alivePlayers(state);
    const currentRound = selectors.currentRound(state);
    const eliminated = currentRound?.eliminated_player_id
        ? selectors.findPlayer(state, currentRound.eliminated_player_id)
        : null;

    const killedNpc = currentRound?.killer_target_npc_id
        ? selectors.findNpc(state, currentRound.killer_target_npc_id)
        : null;
    const showKilledNpc = killedNpc && !killedNpc.is_alive ? killedNpc : null;

    return (
        <PageShell phase="day">
            <div className="p-6 max-w-2xl mx-auto">
                <Headline glow="yellow" subtitle="Discussione e Voto">
                    GIORNO {state.current_round}
                </Headline>

                {/* Breaking news */}
                {eliminated && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <PulpCard variant="danger" className="mb-6 p-6 text-center">
                            <p className="text-headline text-xs text-blood tracking-widest mb-2">BREAKING NEWS</p>
                            <p className="text-headline text-3xl text-blood glow-red">{eliminated.name}</p>
                            <p className="text-ui text-cream/40 text-sm mt-2">Giocatore eliminato</p>
                        </PulpCard>
                    </motion.div>
                )}

                {showKilledNpc && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                    >
                        <PulpCard variant="danger" className="mb-6 p-6 text-center relative stamp-victim">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Skull size={14} color="#d4364b" />
                                <p className="text-headline text-xs text-cream/35 tracking-widest">NPC UCCISO DURANTE LA NOTTE</p>
                            </div>
                            <p className="text-headline text-2xl text-blood">{showKilledNpc.name}</p>
                        </PulpCard>
                    </motion.div>
                )}

                {/* Alive players grid */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <PulpCard variant="vintage" className="mb-6 p-6">
                        <h2 className="text-headline text-xl text-taxi mb-4">SOSPETTI IN VITA</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {alivePlayers.map((player, i) => (
                                <motion.div
                                    key={player.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.25 + i * 0.04 }}
                                    className="bg-noir/40 border border-tobacco/20 rounded-lg p-3 text-center"
                                >
                                    <p className="text-ui font-medium text-cream text-sm">{player.name}</p>
                                </motion.div>
                            ))}
                        </div>
                    </PulpCard>
                </motion.div>

                {/* NPC profiles */}
                <NpcProfilesPanel npcs={state.npcs ?? []} players={state.players ?? []} />

                {/* Suspect Dossier */}
                <SuspectDossier />

                {/* Discussion prompt */}
                <PulpCard className="mb-8 p-6 text-center" style={{ borderColor: 'rgba(212,168,67,0.2)' }}>
                    <Quote size={20} className="text-taxi/20 mx-auto mb-3" />
                    <p className="text-quote text-cream/60 text-lg mb-2">
                        Discutete e decidete di chi non vi fidate.
                    </p>
                    <p className="text-ui text-cream/35 text-sm">
                        Quando siete pronti, procedete al voto.
                    </p>
                </PulpCard>

                <NeonButton color="red" onClick={continueToVote}>
                    Procedi al Voto
                </NeonButton>
            </div>
        </PageShell>
    );
}
