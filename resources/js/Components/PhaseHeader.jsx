export default function PhaseHeader({ phase, round, subtitle }) {
    const phaseLabels = {
        setup: 'Preparazione',
        role_reveal: 'Rivelazione Ruoli',
        n1_intro: 'Prima Notte',
        n1_vote: 'Primo Voto',
        night: 'Notte',
        morning: 'Mattina',
        day: 'Giorno',
        vote: 'Votazione',
        medium_reveal: 'Visione del Medium',
        game_over: 'Fine Partita',
    };

    const isNight = ['night', 'n1_intro'].includes(phase);

    return (
        <div className={`text-center py-4 px-6 ${isNight ? 'bg-indigo-950' : 'bg-gray-800'}`}>
            <h1 className="text-xl font-bold text-white">
                {phaseLabels[phase] || phase}
            </h1>
            {round > 0 && (
                <p className="text-sm text-gray-400 mt-1">Round {round}</p>
            )}
            {subtitle && (
                <p className="text-sm text-gray-300 mt-1">{subtitle}</p>
            )}
        </div>
    );
}
