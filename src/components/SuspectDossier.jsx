import React, { useState } from 'react';
import { useGame } from '@/engine/gameState';
import PulpCard from './PulpCard';

export default function SuspectDossier() {
    const { state } = useGame();
    const [open, setOpen] = useState(false);

    // Only show rounds that have saved hints (past rounds)
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
                <span className="text-cream/50 text-sm text-ui">
                    {open ? '▲ Nascondi' : '▼ Mostra'} ({roundsWithHints.length})
                </span>
            </button>

            {open && (
                <div className="px-6 pb-6 relative">
                    {/* Vertical timeline line */}
                    <div className="absolute left-9 top-0 bottom-6 w-px bg-taxi/30" />

                    <div className="space-y-4">
                        {roundsWithHints.map(round => (
                            <div key={round.round_number} className="flex gap-4 relative">
                                {/* Timeline dot */}
                                <div className="flex-shrink-0 w-6 flex items-start justify-center pt-3 relative z-10">
                                    <div className="w-3 h-3 rounded-full bg-taxi border-2 border-noir" />
                                </div>

                                {/* Card content */}
                                <div className="flex-1 bg-noir/50 border border-tobacco/30 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-headline text-sm text-taxi">
                                            {round.hint_npc_name ?? 'NPC'}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {round.hint_npc_alive === false && (
                                                <span className="text-headline text-xs text-blood border border-blood/50 px-2 py-0.5 rounded">
                                                    VITTIMA
                                                </span>
                                            )}
                                            <span className="text-ui text-xs text-cream/40">
                                                Round {round.round_number}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="border-l-2 border-taxi/40 pl-3">
                                        <p className="text-quote text-sm text-cream/70 leading-relaxed italic">
                                            &ldquo;{round.hint_text}&rdquo;
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </PulpCard>
    );
}
