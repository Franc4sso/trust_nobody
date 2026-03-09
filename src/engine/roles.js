// [killers, guardians, mediums, analysts, seers, citizens]
const DISTRIBUTION = {
    4:  [1, 1, 0, 0, 0, 2],
    5:  [1, 1, 0, 0, 0, 3],
    6:  [1, 1, 0, 1, 0, 3],
    7:  [2, 1, 1, 1, 0, 2],
    8:  [2, 1, 1, 1, 1, 2],
    9:  [2, 1, 1, 1, 1, 3],
    10: [3, 1, 1, 1, 1, 3],
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
    seer: 'Veggente',
    citizen: 'Cittadino',
};

export const ROLE_DESCRIPTIONS = {
    serial_killer: 'Ogni notte puoi uccidere o minacciare un NPC. Se elimini tutti gli NPC, vinci.',
    guardian: "Ogni notte puoi proteggere un NPC dall'attacco del killer.",
    medium: "Dopo ogni eliminazione puoi scoprire in segreto se il giocatore eliminato era il killer.",
    analyst: 'Una volta a partita, di notte, puoi indagare su un NPC per scoprire se sta dicendo la verità o è stato minacciato dal killer.',
    seer: 'Una volta a partita, di notte, puoi scoprire il ruolo di un giocatore.',
    citizen: 'Non hai poteri speciali, ma la tua voce conta nelle votazioni.',
};

// Optional roles that the master can toggle (serial_killer and citizen are always present)
export const OPTIONAL_ROLES = ['guardian', 'medium', 'analyst', 'seer'];

/**
 * Get the default distribution for a player count, with role counts.
 * @param {number} count - number of players
 * @returns {Object} { serial_killer, guardian, medium, analyst, seer, citizen }
 */
export function getDistribution(count) {
    const dist = DISTRIBUTION[count] ?? DISTRIBUTION[6];
    return {
        serial_killer: dist[0],
        guardian: dist[1],
        medium: dist[2],
        analyst: dist[3],
        seer: dist[4],
        citizen: dist[5],
    };
}

/**
 * Assign roles to players.
 * @param {Array} players - array of player objects (with id, sort_order)
 * @param {Array} [enabledRoles] - optional list of enabled role keys (serial_killer and citizen always included)
 * @param {number} [killerCount] - override number of serial killers (defaults to distribution)
 * @returns {Array} players with role assigned
 */
export function assignRoles(players, enabledRoles, killerCount) {
    const count = players.length;
    const dist = getDistribution(count);

    // Override killer count if provided
    if (killerCount != null) {
        dist.serial_killer = killerCount;
    }

    // If enabledRoles provided, disabled roles become citizens
    const enabled = enabledRoles
        ? new Set([...enabledRoles, 'serial_killer', 'citizen'])
        : new Set(Object.keys(dist));

    let roles = [];

    for (const [role, num] of Object.entries(dist)) {
        if (role === 'citizen') continue;
        if (enabled.has(role)) {
            roles = roles.concat(Array(num).fill(role));
        }
    }

    // Fill remaining slots with citizens
    const citizenCount = Math.max(0, count - roles.length);
    roles = roles.concat(Array(citizenCount).fill('citizen'));
    roles = shuffle(roles);

    const sorted = [...players].sort((a, b) => a.sort_order - b.sort_order);

    return sorted.map((player, i) => ({
        ...player,
        role: roles[i],
        role_label: ROLE_LABELS[roles[i]],
        role_description: ROLE_DESCRIPTIONS[roles[i]],
    }));
}
