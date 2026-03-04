import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, selectors } from '@/engine/gameState';
import PageShell from '@/components/PageShell';
import Headline from '@/components/Headline';
import PulpCard from '@/components/PulpCard';
import NeonButton from '@/components/NeonButton';

export default function NpcIntroductions() {
    const navigate = useNavigate();
    const { state, dispatch, ACTIONS } = useGame();

    const [currentNpcIndex, setCurrentNpcIndex] = useState(0);
    const npcs = state.npcs || [];

    const npc = npcs[currentNpcIndex];

    const nextNpc = () => {
        if (currentNpcIndex < npcs.length - 1) {
            setCurrentNpcIndex(currentNpcIndex + 1);
        } else {
            dispatch({
                type: ACTIONS.SET_PHASE_AND_ROUND,
                payload: { phase: 'n1_vote' },
            });
            navigate('/n1/vote');
        }
    };

    return (
        <PageShell>
            <div className="p-6 max-w-lg mx-auto">
                <Headline glow="yellow" subtitle={`${npcs.length - currentNpcIndex - 1} profili rimangono`}>
                    PROFILI SOSPETTI
                </Headline>

                {npc && (
                    <PulpCard variant="vintage" className="space-y-6 animate-fade-in-up" key={npc.id}>
                        {/* NPC avatar placeholder + name */}
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full border-2 border-taxi bg-asphalt mx-auto mb-4 flex items-center justify-center">
                                <span className="text-headline text-3xl text-taxi">
                                    {npc.name.charAt(0)}
                                </span>
                            </div>
                            <h2 className="text-headline text-3xl text-taxi">{npc.name}</h2>
                            <p className="text-quote text-cream/50 capitalize mt-1">{npc.personality}</p>
                        </div>

                        {/* Backstory */}
                        <div className="card-pulp p-5">
                            <p className="text-cream/70 text-sm leading-relaxed">
                                {npc.backstory}
                            </p>
                        </div>

                        {/* Connections as "handwritten notes" */}
                        <div className="space-y-2 bg-noir/50 rounded-lg p-4 border-l-2 border-tobacco">
                            {(npc.connection_descriptions || []).map((conn, i) => (
                                <p key={i} className="text-quote text-cream/60 text-sm">
                                    &ldquo;{conn.text}&rdquo;
                                </p>
                            ))}
                        </div>

                        <NeonButton color="yellow" onClick={nextNpc}>
                            {currentNpcIndex < npcs.length - 1 ? 'Prossimo Fascicolo' : 'Procedi'}
                        </NeonButton>
                    </PulpCard>
                )}

                {/* Progress */}
                <div className="mt-6 flex gap-2 justify-center">
                    {npcs.map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                i <= currentNpcIndex ? 'w-6 bg-taxi' : 'w-3 bg-asphalt'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </PageShell>
    );
}
