import { useState } from 'react';
import { router } from '@inertiajs/react';
import PhaseHeader from '../../Components/PhaseHeader';
import NpcCard from '../../Components/NpcCard';

function KillerStep({ game, killerNames, npcs }) {
    const [action, setAction] = useState('kill');
    const [selectedNpc, setSelectedNpc] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const submit = () => {
        if (!selectedNpc || submitted) return;
        setSubmitted(true);
        router.post(`/games/${game.id}/night/killer`, {
            action,
            target_npc_id: selectedNpc.id,
        });
    };

    return (
        <div>
            <div className="bg-indigo-900/50 rounded-xl p-4 mb-6 border border-indigo-800 text-center">
                <p className="text-lg font-bold text-red-400 mb-1">
                    Killer, aprite gli occhi
                </p>
                <p className="text-sm text-indigo-300">
                    {killerNames.length === 1
                        ? `${killerNames[0]} decide`
                        : `${killerNames.join(', ')} decidono insieme`}
                </p>
            </div>

            <div className="mb-6">
                <p className="text-indigo-300 text-center mb-4">
                    Scegli l'azione
                </p>
                <div className="flex gap-3 mb-4">
                    <button
                        onClick={() => setAction('kill')}
                        className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
                            action === 'kill'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-800 text-gray-400'
                        }`}
                    >
                        Uccidi
                    </button>
                    <button
                        onClick={() => setAction('threaten')}
                        className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
                            action === 'threaten'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-800 text-gray-400'
                        }`}
                    >
                        Minaccia
                    </button>
                </div>
                <p className="text-sm text-gray-400 text-center">
                    {action === 'kill'
                        ? "L'NPC muore (se non protetto dal Guardiano)"
                        : "L'NPC darà indizi fuorvianti"}
                </p>
            </div>

            <div className="space-y-3">
                {npcs.map((npc) => (
                    <NpcCard
                        key={npc.id}
                        npc={npc}
                        onClick={setSelectedNpc}
                        selected={selectedNpc?.id === npc.id}
                        compact
                    />
                ))}
            </div>

            {selectedNpc && (
                <button
                    onClick={submit}
                    disabled={submitted}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl mt-6 transition-colors disabled:opacity-50"
                >
                    {action === 'kill' ? 'Uccidi' : 'Minaccia'} {selectedNpc.name}
                </button>
            )}
        </div>
    );
}

function GuardianStep({ game, npcs }) {
    const [selectedNpc, setSelectedNpc] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const submit = () => {
        if (!selectedNpc || submitted) return;
        setSubmitted(true);
        router.post(`/games/${game.id}/night/guardian`, {
            target_npc_id: selectedNpc.id,
        });
    };

    return (
        <div>
            <div className="bg-indigo-900/50 rounded-xl p-4 mb-6 border border-indigo-800 text-center">
                <p className="text-lg font-bold text-blue-400 mb-1">
                    Killer, chiudete gli occhi. Guardiano, apri gli occhi
                </p>
                <p className="text-sm text-indigo-300">
                    Scegli un NPC da proteggere questa notte
                </p>
            </div>

            <div className="space-y-3">
                {npcs.map((npc) => (
                    <NpcCard
                        key={npc.id}
                        npc={npc}
                        onClick={setSelectedNpc}
                        selected={selectedNpc?.id === npc.id}
                        compact
                    />
                ))}
            </div>

            {selectedNpc && (
                <button
                    onClick={submit}
                    disabled={submitted}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl mt-6 transition-colors disabled:opacity-50"
                >
                    Proteggi {selectedNpc.name}
                </button>
            )}
        </div>
    );
}

function AnalystStep({ game, analystName }) {
    const [submitted, setSubmitted] = useState(false);

    const submit = (activate) => {
        if (submitted) return;
        setSubmitted(true);
        router.post(`/games/${game.id}/night/analyst`, {
            activate,
        });
    };

    return (
        <div>
            <div className="bg-indigo-900/50 rounded-xl p-4 mb-6 border border-indigo-800 text-center">
                <p className="text-lg font-bold text-green-400 mb-1">
                    Guardiano, chiudi gli occhi. Analista, apri gli occhi
                </p>
                <p className="text-sm text-indigo-300">
                    {analystName} può attivare il potere per un indizio bonus domani
                </p>
            </div>

            <div className="bg-green-900/30 border border-green-700 rounded-xl p-5 mb-6 text-center">
                <p className="text-green-300 text-sm mb-4">
                    Attivare il potere dell'Analista? Domani mattina riceverete un indizio extra basato sui pattern di voto. Questa azione può essere usata solo una volta a partita.
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={() => submit(true)}
                        disabled={submitted}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                    >
                        Attiva potere
                    </button>
                    <button
                        onClick={() => submit(false)}
                        disabled={submitted}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                    >
                        Non ora
                    </button>
                </div>
            </div>
        </div>
    );
}

function SummaryStep({ game, roundResult }) {
    const advance = () => {
        router.post(`/games/${game.id}/advance`);
    };

    return (
        <div>
            <div className="bg-indigo-900/50 rounded-xl p-6 mb-6 border border-indigo-800">
                <h3 className="text-lg font-bold mb-4 text-center">
                    Risultati della notte
                </h3>

                {roundResult.killer_action === 'kill' && (
                    <div className="mb-3">
                        <p className="text-red-400">
                            Il killer ha tentato di uccidere{' '}
                            <strong>{roundResult.target_name}</strong>
                        </p>
                        {roundResult.kill_blocked ? (
                            <p className="text-blue-400 mt-1">
                                Il guardiano ha protetto {roundResult.target_name}! L'attacco è stato bloccato.
                            </p>
                        ) : (
                            <p className="text-red-300 mt-1">
                                {roundResult.target_name} è stato ucciso.
                            </p>
                        )}
                    </div>
                )}

                {roundResult.killer_action === 'threaten' && (
                    <div className="mb-3">
                        <p className="text-yellow-400">
                            Il killer ha minacciato{' '}
                            <strong>{roundResult.target_name}</strong>
                        </p>
                        <p className="text-yellow-300 text-sm mt-1">
                            {roundResult.target_name} darà indizi fuorvianti.
                        </p>
                    </div>
                )}

                {roundResult.guardian_target && roundResult.killer_action === 'kill' && !roundResult.kill_blocked && (
                    <p className="text-gray-400 text-sm mt-2">
                        Il guardiano proteggeva {roundResult.guardian_target}.
                    </p>
                )}
            </div>

            <p className="text-center text-gray-400 text-sm mb-6">
                Solo il master dovrebbe vedere questa schermata.
            </p>

            <button
                onClick={advance}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
                Procedi alla Mattina
            </button>
        </div>
    );
}

export default function MasterNightPanel({ game, step, killerNames, hasGuardian, analystAvailable, analystName, npcs, round, roundResult }) {
    const subtitles = {
        killer: 'Pannello Master',
        guardian: 'Pannello Master',
        analyst: 'Pannello Master',
        summary: 'Riepilogo (solo Master)',
    };

    return (
        <div className="min-h-screen bg-indigo-950 text-white">
            <PhaseHeader phase="night" round={round} subtitle={subtitles[step] || 'Pannello Master'} />
            <div className="p-6 max-w-md mx-auto">
                {step === 'killer' && (
                    <KillerStep
                        game={game}
                        killerNames={killerNames || []}
                        npcs={npcs || []}
                    />
                )}
                {step === 'guardian' && (
                    <GuardianStep game={game} npcs={npcs || []} />
                )}
                {step === 'analyst' && (
                    <AnalystStep game={game} analystName={analystName} />
                )}
                {step === 'summary' && roundResult && (
                    <SummaryStep game={game} roundResult={roundResult} />
                )}
            </div>
        </div>
    );
}
