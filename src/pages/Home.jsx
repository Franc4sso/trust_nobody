import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/engine/gameState';
import PageShell from '@/components/PageShell';
import NeonButton from '@/components/NeonButton';

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
        <PageShell className="flex items-center justify-center p-4">
            {/* Neon glow background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-80 h-80 bg-blood/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-neon-pink/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute top-[30%] right-[10%] w-40 h-40 bg-taxi/10 rounded-full blur-[80px]"></div>
            </div>

            <div className="relative max-w-md w-full text-center z-10 animate-fade-in-up">
                {/* Title */}
                <div className="mb-12">
                    <h1 className="text-headline text-8xl text-blood glow-red animate-neon-flicker leading-none mb-1">
                        TRUST
                    </h1>
                    <h1 className="text-headline text-8xl text-taxi glow-yellow leading-none mb-6">
                        NOBODY
                    </h1>
                    <p className="text-quote text-cream/60 text-lg">
                        Nessuno è al sicuro...
                    </p>
                </div>

                {/* Buttons */}
                <div className="space-y-4 mb-10">
                    <NeonButton color="red" onClick={startNewGame}>
                        Nuova Partita
                    </NeonButton>

                    {state.id && (
                        <NeonButton color="blue" onClick={continueGame}>
                            Continua Partita
                        </NeonButton>
                    )}
                </div>

                {/* Info cards */}
                <div className="space-y-3 px-2">
                    <div className="card-pulp card-danger p-4">
                        <p className="text-ui text-sm text-cream/80">
                            <span className="text-blood font-bold">Serial Killer:</span> Ti aggiri tra gli NPC. Elimina i cittadini per vincere.
                        </p>
                    </div>
                    <div className="card-pulp p-4" style={{ borderColor: 'var(--color-poison)' }}>
                        <p className="text-ui text-sm text-cream/80">
                            <span className="text-poison font-bold">Cittadini:</span> Trovate e votate il killer prima che sia troppo tardi.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-6 border-t border-tobacco/30">
                    <p className="text-headline text-tobacco text-sm tracking-widest">Master di partita</p>
                    <p className="text-ui text-cream/40 text-xs mt-2">
                        Il telefono rimane con il master durante tutto il gioco.
                    </p>
                </div>
            </div>
        </PageShell>
    );
}
