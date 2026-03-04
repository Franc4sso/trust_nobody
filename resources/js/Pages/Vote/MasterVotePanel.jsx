import { useState } from 'react';
import { router } from '@inertiajs/react';
import PhaseHeader from '../../Components/PhaseHeader';

export default function MasterVotePanel({ game, voters, targets, isN1, isRunoff, round }) {
    const [votes, setVotes] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const allVoted = voters.every((v) => votes[v.id] !== undefined);

    const setVote = (voterId, targetId) => {
        setVotes((prev) => ({ ...prev, [voterId]: targetId }));
    };

    const submit = () => {
        if (!allVoted || submitted) return;
        setSubmitted(true);

        const voteArray = voters.map((v) => ({
            voter_id: v.id,
            target_id: votes[v.id],
        }));

        const url = isN1
            ? `/games/${game.id}/n1/vote/all`
            : `/games/${game.id}/vote/all`;

        router.post(url, { votes: voteArray });
    };

    const availableTargets = (voterId) => {
        if (isRunoff) return targets;
        return targets.filter((t) => t.id !== voterId);
    };

    const getTargetName = (targetId) => {
        const target = targets.find((t) => t.id === targetId);
        return target?.name || '';
    };

    const subtitle = isN1
        ? 'Primo voto di sospetto'
        : isRunoff
            ? 'Ballottaggio'
            : 'Chi eliminare?';

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <PhaseHeader
                phase={isN1 ? 'n1_vote' : 'vote'}
                round={round}
                subtitle={subtitle}
            />

            <div className="p-6 max-w-md mx-auto">
                <div className="text-center mb-6">
                    <p className="text-gray-400">
                        {isN1
                            ? 'Il master segna il voto di sospetto di ogni giocatore'
                            : isRunoff
                                ? 'Ballottaggio! Scegli tra i candidati.'
                                : 'Il master segna il voto di ogni giocatore'}
                    </p>
                    {isN1 && (
                        <p className="text-xs text-gray-500 mt-1">
                            Questo voto non elimina nessuno
                        </p>
                    )}
                </div>

                <div className="space-y-4">
                    {voters.map((voter) => {
                        const voterTargets = availableTargets(voter.id);
                        const selectedTarget = votes[voter.id];

                        return (
                            <div
                                key={voter.id}
                                className={`rounded-xl border p-4 transition-colors ${
                                    selectedTarget !== undefined
                                        ? 'border-green-600 bg-gray-800/50'
                                        : 'border-gray-700 bg-gray-800'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-white">
                                        {voter.name}
                                    </span>
                                    {selectedTarget !== undefined && (
                                        <span className="text-sm text-green-400">
                                            &rarr; {getTargetName(selectedTarget)}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {voterTargets.map((target) => (
                                        <button
                                            key={target.id}
                                            onClick={() => setVote(voter.id, target.id)}
                                            disabled={submitted}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                                selectedTarget === target.id
                                                    ? 'bg-red-600 text-white'
                                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                        >
                                            {target.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6">
                    <p className="text-center text-sm text-gray-500 mb-3">
                        {Object.keys(votes).length} / {voters.length} voti registrati
                    </p>

                    <button
                        onClick={submit}
                        disabled={!allVoted || submitted}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition-colors disabled:opacity-50"
                    >
                        Conferma tutti i voti
                    </button>
                </div>
            </div>
        </div>
    );
}
