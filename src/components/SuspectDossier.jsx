import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/engine/gameState';
import { ChevronDown, ChevronUp, AlertTriangle, Skull } from 'lucide-react';
import PulpCard from './PulpCard';

export default function SuspectDossier() {
    const { state } = useGame();
    const [open, setOpen] = useState(false);

    const roundsWithHints = (state.rounds ?? [])
        .filter(r => r.hint_text && r.round_number <= state.current_round)
        .sort((a, b) => b.round_number - a.round_number);

    if (roundsWithHints.length === 0) return null;

    return (
        <PulpCard variant="vintage" className="mb-6 p-0 overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
            >
                <span className="text-headline text-lg text-taxi tracking-wider">
                    DOSSIER INDIZI
                </span>
                <div className="flex items-center gap-2 text-cream/40 text-sm text-ui">
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    <span>({roundsWithHints.length})</span>
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
                        <div className="px-6 pb-6 relative">
                            {/* Vertical timeline line */}
                            <div className="absolute left-9 top-0 bottom-6 w-px bg-taxi/20" />

                            <div className="space-y-4">
                                {roundsWithHints.map((round, i) => (
                                    <motion.div
                                        key={round.round_number}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                        className="flex gap-4 relative"
                                    >
                                        {/* Timeline dot */}
                                        <div className="flex-shrink-0 w-6 flex items-start justify-center pt-3 relative z-10">
                                            <div className="w-2.5 h-2.5 rounded-full bg-taxi border-2 border-noir" />
                                        </div>

                                        {/* Card content */}
                                        <div className="flex-1 bg-noir/40 border border-tobacco/20 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-headline text-sm text-taxi">
                                                    {round.hint_npc_name ?? 'NPC'}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {round.hint_npc_unreliable && (
                                                        <span className="flex items-center gap-1 text-xs text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded">
                                                            <AlertTriangle size={10} />
                                                            <span className="text-headline">INAFFIDABILE</span>
                                                        </span>
                                                    )}
                                                    {round.hint_npc_alive === false && (
                                                        <span className="flex items-center gap-1 text-xs text-blood border border-blood/30 px-2 py-0.5 rounded">
                                                            <Skull size={10} />
                                                            <span className="text-headline">VITTIMA</span>
                                                        </span>
                                                    )}
                                                    <span className="text-ui text-xs text-cream/30">
                                                        R{round.round_number}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="border-l-2 border-taxi/25 pl-3">
                                                <p className="text-quote text-sm text-cream/60 leading-relaxed italic">
                                                    &ldquo;{round.hint_text}&rdquo;
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PulpCard>
    );
}
