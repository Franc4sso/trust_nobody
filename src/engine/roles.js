// [killers, guardians, mediums, analysts, citizens]
const DISTRIBUTION = {
    4:  [1, 1, 0, 0, 2],
    5:  [1, 1, 0, 0, 3],
    6:  [1, 1, 0, 1, 3],
    7:  [2, 1, 1, 1, 2],
    8:  [2, 1, 1, 1, 3],
    9:  [2, 1, 1, 1, 4],
    10: [3, 1, 1, 1, 4],
};

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export const ROLE_LABELS = {
    serial_killer: 'Serial Killer',
    guardian: 'Guardiano',
    medium: 'Medium',
    analyst: 'Analista',
    citizen: 'Cittadino',
};

export const ROLE_DESCRIPTIONS = {
    serial_killer: 'Ogni notte puoi uccidere o minacciare un NPC. Se elimini tutti gli NPC, vinci.',
    guardian: "Ogni notte puoi proteggere un NPC dall'attacco del killer.",
    medium: "Dopo ogni eliminazione puoi scoprire in segreto se il giocatore eliminato era il killer.",
    analyst: 'Una volta a partita puoi attivare il tuo potere di notte per ricevere un indizio bonus basato sui pattern di voto.',
    citizen: 'Non hai poteri speciali, ma la tua voce conta nelle votazioni.',
};

/**
 * Assign roles to players.
 * @param {Array} players - array of player objects (with id, sort_order)
 * @returns {Array} players with role assigned
 */
export function assignRoles(players) {
    const count = players.length;
    const dist = DISTRIBUTION[count] ?? DISTRIBUTION[6];

    let roles = [];
    roles = roles.concat(Array(dist[0]).fill('serial_killer'));
    roles = roles.concat(Array(dist[1]).fill('guardian'));
    roles = roles.concat(Array(dist[2]).fill('medium'));
    roles = roles.concat(Array(dist[3]).fill('analyst'));
    roles = roles.concat(Array(dist[4]).fill('citizen'));

    roles = shuffle(roles);

    const sorted = [...players].sort((a, b) => a.sort_order - b.sort_order);

    return sorted.map((player, i) => ({
        ...player,
        role: roles[i],
        role_label: ROLE_LABELS[roles[i]],
        role_description: ROLE_DESCRIPTIONS[roles[i]],
    }));
}
