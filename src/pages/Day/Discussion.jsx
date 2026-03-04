import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, selectors } from '@/engine/gameState';
import PageShell from '@/components/PageShell';
import Headline from '@/components/Headline';
import PulpCard from '@/components/PulpCard';
import NeonButton from '@/components/NeonButton';
import SuspectDossier from '@/components/SuspectDossier';

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
        <PageShell>
            <div className="p-6 max-w-2xl mx-auto">
                <Headline glow="yellow" subtitle="Discussione e Voto">
                    GIORNO {state.current_round}
                </Headline>

                {/* Eliminated player - BREAKING NEWS */}
                {eliminated && (
                    <PulpCard variant="danger" className="mb-6 p-6 text-center animate-fade-in-up">
                        <p className="text-headline text-sm text-blood tracking-widest mb-2">BREAKING NEWS</p>
                        <p className="text-headline text-3xl text-blood glow-red">{eliminated.name}</p>
                        <p className="text-ui text-cream/50 text-sm mt-2">Giocatore eliminato</p>
                    </PulpCard>
                )}

                {/* Killed NPC */}
                {showKilledNpc && (
                    <PulpCard variant="danger" className="mb-6 p-6 text-center relative stamp-victim animate-fade-in-up">
                        <p className="text-headline text-sm text-cream/40 tracking-widest mb-2">NPC UCCISO DURANTE LA NOTTE</p>
                        <p className="text-headline text-2xl text-blood">{showKilledNpc.name}</p>
                    </PulpCard>
                )}

                {/* Alive players grid */}
                <PulpCard variant="vintage" className="mb-6 p-6">
                    <h2 className="text-headline text-xl text-taxi mb-4">SOSPETTI IN VITA</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {alivePlayers.map((player) => (
                            <div key={player.id} className="bg-noir/50 border border-tobacco/30 rounded-lg p-3 text-center">
                                <p className="text-ui font-semibold text-cream text-sm">{player.name}</p>
                            </div>
                        ))}
                    </div>
                </PulpCard>

                {/* Suspect Dossier - cumulative hints from past rounds */}
                <SuspectDossier />

                {/* Discussion prompt */}
                <PulpCard className="mb-8 p-6 text-center" style={{ borderColor: 'var(--color-taxi)' }}>
                    <p className="text-quote text-cream/70 text-lg mb-2">
                        Discutete e decidete di chi non vi fidate.
                    </p>
                    <p className="text-ui text-cream/40 text-sm">
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
