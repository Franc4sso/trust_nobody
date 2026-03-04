import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, selectors } from '@/engine/gameState';
import { generateHint } from '@/engine/hints';
import PageShell from '@/components/PageShell';
import Headline from '@/components/Headline';
import PulpCard from '@/components/PulpCard';
import NeonButton from '@/components/NeonButton';

export default function NpcHint() {
    const navigate = useNavigate();
    const { state, dispatch, ACTIONS } = useGame();

    const currentRound = selectors.currentRound(state);
    const hintNpc = currentRound?.hint_npc_id
        ? selectors.findNpc(state, currentRound.hint_npc_id)
        : null;

    const isThreatened = hintNpc?.is_threatened || false;
    const hintRef = useRef(null);
    if (hintRef.current === null && hintNpc) {
        hintRef.current = generateHint(state, hintNpc, isThreatened);
    }
    const hint = hintRef.current ?? '';
    const analystBonus = currentRound?.analyst_bonus_hint || null;

    // Save hint text and NPC name into the round for the Dossier
    useEffect(() => {
        if (hint && hintNpc && currentRound && !currentRound.hint_text) {
            dispatch({
                type: ACTIONS.UPDATE_ROUND,
                payload: {
                    round_number: currentRound.round_number,
                    updates: {
                        hint_text: hint,
                        hint_npc_name: hintNpc.name,
                        hint_npc_alive: hintNpc.is_alive,
                    },
                },
            });
        }
    }, [hint, hintNpc, currentRound, dispatch, ACTIONS]);

    const continueToDay = () => {
        dispatch({
            type: ACTIONS.SET_PHASE_AND_ROUND,
            payload: { phase: 'day' },
        });
        navigate('/day');
    };

    return (
        <PageShell>
            {/* Subtle dawn gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-noir via-noir to-[#1a1510] pointer-events-none" />

            <div className="p-6 max-w-2xl mx-auto relative z-10">
                <Headline glow="yellow" subtitle={`Round ${state.current_round}`}>
                    MATTINO — INDIZIO
                </Headline>

                <PulpCard variant="vintage" className="space-y-6 animate-fade-in-up">
                    {hintNpc ? (
                        <>
                            <div className="text-center relative">
                                {!hintNpc.is_alive && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                        <span className="text-headline text-4xl text-blood glow-red -rotate-12 border-2 border-blood px-4 py-1">
                                            VITTIMA
                                        </span>
                                    </div>
                                )}
                                <div className="w-16 h-16 rounded-full border-2 border-taxi bg-asphalt mx-auto mb-3 flex items-center justify-center">
                                    <span className="text-headline text-2xl text-taxi">
                                        {hintNpc.name.charAt(0)}
                                    </span>
                                </div>
                                <h2 className="text-headline text-3xl text-taxi">{hintNpc.name}</h2>
                            </div>

                            {/* Main hint as testimony */}
                            <div className="bg-noir/50 rounded-lg p-6 border-l-4 border-taxi relative">
                                <span className="text-headline text-6xl text-taxi/20 absolute top-2 left-4">&ldquo;</span>
                                <p className="text-quote text-lg text-cream/80 leading-relaxed pl-6 pt-4">
                                    {hint}
                                </p>
                                <span className="text-headline text-6xl text-taxi/20 absolute bottom-0 right-4">&rdquo;</span>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-cream/40">Nessun NPC disponibile questa mattina.</p>
                        </div>
                    )}

                    {/* Analyst bonus */}
                    {analystBonus && (
                        <PulpCard variant="info" className="p-4 border-l-4 border-l-neon-blue">
                            <p className="text-headline text-xs text-neon-blue tracking-widest mb-2">ANALISI DELL'ANALISTA</p>
                            <p className="text-quote text-cream/80 leading-relaxed">&ldquo;{analystBonus}&rdquo;</p>
                        </PulpCard>
                    )}

                    <NeonButton color="yellow" onClick={continueToDay}>
                        Continua al Giorno
                    </NeonButton>
                </PulpCard>
            </div>
        </PageShell>
    );
}
