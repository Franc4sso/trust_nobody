import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, selectors } from '@/engine/gameState';
import { advance } from '@/engine/stateMachine';
import { checkWinCondition } from '@/engine/winCondition';
import { getRouteForPhase } from '@/engine/phaseRoutes';
import PageShell from '@/components/PageShell';
import Headline from '@/components/Headline';
import PulpCard from '@/components/PulpCard';
import NeonButton from '@/components/NeonButton';

export default function MediumReveal() {
    const navigate = useNavigate();
    const { state, dispatch, ACTIONS } = useGame();

    const currentRound = selectors.currentRound(state);
    const eliminatedPlayer = currentRound?.eliminated_player_id
        ? selectors.findPlayer(state, currentRound.eliminated_player_id)
        : null;

    const isKiller = eliminatedPlayer?.role === 'serial_killer';

    const continueToNight = () => {
        const { next, updates } = advance(state, checkWinCondition);

        dispatch({
            type: ACTIONS.SET_PHASE_AND_ROUND,
            payload: { phase: next, ...updates },
        });

        navigate(getRouteForPhase(next));
    };

    return (
        <PageShell>
            {/* Mystic purple glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-morphine/5 via-noir to-noir pointer-events-none" />

            <div className="p-6 max-w-lg mx-auto relative z-10 flex items-center justify-center min-h-screen">
                <div className="w-full">
                    <Headline glow="purple" subtitle="Il medium ha investigato l'ultimo eliminato...">
                        MEDIUM REVEAL
                    </Headline>

                    {eliminatedPlayer && (
                        <PulpCard className="space-y-6 animate-fade-in-up" style={{ borderColor: 'var(--color-morphine)' }}>
                            {/* Player name */}
                            <div className="border-2 border-morphine rounded-lg p-5 text-center bg-noir/60">
                                <h2 className="text-headline text-3xl text-cream">{eliminatedPlayer.name}</h2>
                            </div>

                            {/* Verdict */}
                            <div className="text-center py-4">
                                <p className="text-headline text-sm text-cream/40 tracking-widest mb-3">ERA UN...</p>
                                <p className={`text-headline text-5xl ${isKiller ? 'text-blood glow-red' : 'text-poison glow-green'}`}>
                                    {eliminatedPlayer.role_label}
                                </p>
                            </div>

                            <div className="text-center">
                                {isKiller ? (
                                    <p className="text-headline text-xl text-blood glow-red tracking-widest">COLPEVOLE</p>
                                ) : (
                                    <p className="text-headline text-xl text-poison glow-green tracking-widest">INNOCENTE</p>
                                )}
                            </div>

                            <NeonButton color={isKiller ? 'red' : 'green'} onClick={continueToNight}>
                                Continua alla Notte Successiva
                            </NeonButton>
                        </PulpCard>
                    )}
                </div>
            </div>
        </PageShell>
    );
}
