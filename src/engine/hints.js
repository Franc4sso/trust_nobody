/**
 * DynamicHintService translated from PHP.
 * @param {Object} state - game state
 * @param {Object} npc - npc object
 * @param {boolean} isThreatened
 * @returns {string}
 */
export function generateHint(state, npc, isThreatened) {
    const round = state.current_round;
    const connections = npc.connections ?? [];
    const players = state.players ?? [];
    const playerNames = Object.fromEntries(players.map((p) => [p.id, p.name]));

    const connNames = connections.map((id) => playerNames[id] ?? 'Sconosciuto');
    const killerIds = players.filter((p) => p.role === 'serial_killer').map((p) => p.id);
    const connKillerIds = connections.filter((id) => killerIds.includes(id));
    const connInnocentIds = connections.filter((id) => !killerIds.includes(id));

    const knowsKiller = connKillerIds.length > 0;

    if (isThreatened) {
        return threatenedHint(state, connNames, connKillerIds, connInnocentIds, playerNames, round);
    }

    if (!knowsKiller) {
        return innocentConnectionsHint(connNames, round);
    }

    return killerConnectionsHint(connNames, connKillerIds, connInnocentIds, playerNames, round);
}

/**
 * Analyst bonus hint based on vote patterns.
 */
export function generateAnalystBonus(state) {
    const playerNames = Object.fromEntries((state.players ?? []).map((p) => [p.id, p.name]));
    const killerIds = (state.players ?? []).filter((p) => p.role === 'serial_killer').map((p) => p.id);
    const allVotes = state.votes ?? [];

    const pattern = analyzeVotePatterns(state, playerNames, killerIds, allVotes);

    if (pattern) return pattern;

    const templates = [
        "Le votazioni finora non rivelano schemi chiari. Qualcuno è molto bravo a nascondersi nel voto.",
        "Ho analizzato ogni voto espresso... c'è qualcuno che vota sempre in modo strategico, ma non riesco ancora a capire chi.",
        "I pattern di voto sono confusi. Forse è proprio questo il piano del killer: creare caos nelle assemblee.",
    ];
    return templates[Math.floor(Math.random() * templates.length)];
}

function analyzeVotePatterns(state, playerNames, killerIds, allVotes) {
    if (!allVotes.length) return null;

    const patterns = [];

    // Group by round
    const votesByRound = {};
    for (const v of allVotes) {
        const rn = v.round_number;
        if (!votesByRound[rn]) votesByRound[rn] = [];
        votesByRound[rn].push(v);
    }

    for (const roundVotes of Object.values(votesByRound)) {
        const byTarget = {};
        for (const v of roundVotes) {
            const tid = v.target_player_id;
            if (!byTarget[tid]) byTarget[tid] = [];
            byTarget[tid].push(v.voter_player_id);
        }
        for (const [targetId, voterIds] of Object.entries(byTarget)) {
            if (voterIds.length >= 2) {
                const voterNamesList = voterIds.map((id) => playerNames[id] ?? '?');
                const targetName = playerNames[targetId] ?? '?';
                const hasKiller = voterIds.some((id) => killerIds.includes(id));
                const hasInnocent = voterIds.some((id) => !killerIds.includes(id));
                if (hasKiller && hasInnocent) {
                    const mentionedNames = voterNamesList.slice(0, 3).join(' e ');
                    patterns.push(`Ho notato che ${mentionedNames} hanno votato insieme contro ${targetName}. Coincidenza o strategia?`);
                }
            }
        }
    }

    // Never targeted
    const allTargeted = {};
    for (const v of allVotes) {
        allTargeted[v.target_player_id] = (allTargeted[v.target_player_id] ?? 0) + 1;
    }
    const alivePlayers = (state.players ?? []).filter((p) => p.is_alive);
    const neverTargeted = alivePlayers.filter((p) => !allTargeted[p.id]);
    if (neverTargeted.length >= 1 && neverTargeted.length <= 3) {
        const nameList = neverTargeted.map((p) => p.name).join(', ');
        patterns.push(`Strano: ${nameList} non ha mai ricevuto nemmeno un voto. Nessuno li sospetta... o nessuno osa accusarli?`);
    }

    // Voter who changes target every round
    const voterTargets = {};
    for (const v of allVotes) {
        if (!voterTargets[v.voter_player_id]) voterTargets[v.voter_player_id] = [];
        voterTargets[v.voter_player_id].push(v.target_player_id);
    }
    const voterIds = Object.keys(voterTargets);
    for (const voterId of voterIds) {
        const targets = voterTargets[voterId];
        if (targets.length >= 2 && new Set(targets).size === targets.length) {
            const voterName = playerNames[voterId] ?? '?';
            const otherVoterIds = voterIds.filter((id) => id !== voterId);
            const otherVoterId = otherVoterIds[Math.floor(Math.random() * otherVoterIds.length)];
            const otherName = otherVoterId ? playerNames[otherVoterId] : null;
            if (otherName) {
                patterns.push(`${voterName} cambia bersaglio ad ogni votazione. Anche ${otherName} si comporta in modo strano durante i voti.`);
            } else {
                patterns.push(`${voterName} cambia bersaglio ad ogni votazione. Un comportamento del genere è sospetto.`);
            }
        }
    }

    // Who voted to eliminate an innocent
    for (const r of (state.rounds ?? [])) {
        if (r.eliminated_player_id) {
            const eliminated = (state.players ?? []).find((p) => p.id === r.eliminated_player_id);
            if (eliminated && eliminated.role !== 'serial_killer') {
                const roundVotes = allVotes.filter(
                    (v) => v.round_number === r.round_number && !v.is_runoff
                );
                const pushers = roundVotes
                    .filter((v) => v.target_player_id === eliminated.id)
                    .map((v) => playerNames[v.voter_player_id] ?? '?');
                if (pushers.length >= 2) {
                    const pusherList = pushers.slice(0, 3).join(', ');
                    patterns.push(`${pusherList} hanno spinto per eliminare ${eliminated.name}, che era innocente. Chi di loro aveva interesse a farlo fuori?`);
                }
            }
        }
    }

    if (!patterns.length) return null;
    return patterns[Math.floor(Math.random() * patterns.length)];
}

function threatenedHint(state, connNames, connKillerIds, connInnocentIds, playerNames, round) {
    const alivePlayerIds = (state.players ?? []).filter((p) => p.is_alive).map((p) => p.id);
    const aliveInnocentConnIds = connInnocentIds.filter((id) => alivePlayerIds.includes(id));
    const innocentNames = aliveInnocentConnIds.map((id) => playerNames[id]);

    if (innocentNames.length >= 2) {
        shuffle_arr(innocentNames);
        const name1 = innocentNames[0];
        const name2 = innocentNames[1];
        const name3 = innocentNames[2] ?? null;
        const nameList = innocentNames.join(', ');

        let templates;
        if (round <= 2) {
            templates = [
                `Ho visto ${nameList} aggirarsi la scorsa notte. Uno di loro nasconde qualcosa.`,
                `Tra le persone che conosco — ${nameList} — qualcuno non è chi dice di essere.`,
                `Conosco ${nameList}. Uno di loro mi mette a disagio, ma non saprei dire chi.`,
                `${nameList}... li osservo da un po'. C'è qualcosa che non quadra in uno di loro.`,
            ];
        } else if (round <= 4) {
            const shortList = name3 ? `${name1}, ${name2} e ${name3}` : nameList;
            templates = [
                `Tra ${nameList}, il cerchio si stringe. Osservate chi è più nervoso.`,
                `Qualcuno tra ${shortList} non dice tutta la verità. Ne sono certo.`,
                `Le mie osservazioni mi portano a sospettare di qualcuno tra ${shortList}. Ma chi?`,
                `Ho notato comportamenti strani tra ${shortList}. Qualcuno di loro nasconde qualcosa.`,
            ];
        } else {
            const shortList = name3 ? `${name1}, ${name2} o ${name3}` : `${name1}, ${name2} o qualcun altro tra chi conosco`;
            templates = [
                `Posso restringere: tra ${shortList}. Uno di loro mente.`,
                `Dopo tutto quello che ho visto, il colpevole è tra ${shortList}.`,
                `Sono quasi certo: ${shortList}. Uno di questi ha le mani sporche.`,
                `Vi dico solo questo: guardate bene ${shortList}. La risposta è lì.`,
            ];
        }
        return templates[Math.floor(Math.random() * templates.length)];
    }

    if (innocentNames.length === 1) {
        const name = innocentNames[0];
        let templates;
        if (round <= 2) {
            templates = [
                `Tra le persone che conosco, ${name} mi mette a disagio. Non saprei dire perché.`,
                `Ho osservato ${name} attentamente. C'è qualcosa che non torna.`,
            ];
        } else {
            templates = [
                `Le mie osservazioni mi portano a sospettare di ${name}. Qualcosa non quadra.`,
                `Dopo tutto quello che ho visto, ${name} è in cima alla mia lista di sospetti.`,
            ];
        }
        return templates[Math.floor(Math.random() * templates.length)];
    }

    const templates = [
        "Non ho notato nulla di sospetto tra chi conosco. Ma qualcosa nell'aria è cambiato.",
        "Le votazioni dell'ultimo turno mi hanno fatto pensare. Qualcuno tra voi sta giocando sporco.",
        "Ho osservato tutti attentamente. Il pericolo è vicino, ma non riesco a capire da dove viene.",
        "Qualcosa non quadra nel villaggio. Non mi fido più di nessuno.",
        "La notte scorsa ho sentito dei passi. Qualcuno si muove nell'ombra, ma non so chi.",
    ];
    return templates[Math.floor(Math.random() * templates.length)];
}

function innocentConnectionsHint(connNames, round) {
    const nameList = connNames.join(', ');
    const templates = [
        `Le persone che conosco — ${nameList} — mi sembrano tutte a posto. Il pericolo è altrove.`,
        "Non ho notato nulla di sospetto tra chi conosco. Ma qualcosa nell'aria è cambiato.",
        `${nameList}... li conosco bene, non credo che siano coinvolti. Il killer è qualcun altro.`,
        `Ho osservato ${nameList} attentamente. Non mi sembrano pericolosi.`,
    ];
    if (round >= 2) {
        templates.push("Le votazioni dell'ultimo turno mi hanno fatto pensare. Qualcuno tra voi sta giocando sporco.");
        templates.push(`Ho notato tensione durante le votazioni. Ma tra chi conosco — ${nameList} — nessuno mi sembra il colpevole.`);
    }
    return templates[Math.floor(Math.random() * templates.length)];
}

function killerConnectionsHint(connNames, connKillerIds, connInnocentIds, playerNames, round) {
    const killerNames = connKillerIds.map((id) => playerNames[id]);
    const innocentNames = connInnocentIds.map((id) => playerNames[id]);
    const nameList = connNames.join(', ');

    if (round <= 2) {
        const templates = [
            `Ho visto ${nameList} aggirarsi la scorsa notte. Uno di loro nasconde qualcosa.`,
            `Tra le persone che conosco — ${nameList} — qualcuno non è chi dice di essere.`,
            `Conosco ${nameList}. Uno di loro mi mette a disagio, ma non saprei dire chi.`,
            `${nameList}... li osservo da un po'. C'è qualcosa che non quadra in uno di loro.`,
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    }

    if (round <= 4) {
        const killerName = killerNames[0];
        const extra = shuffle_arr([...innocentNames]).slice(0, 2);
        let shortList;
        if (extra.length >= 2) {
            shortList = [killerName, ...extra].join(', ');
        } else if (extra.length === 1) {
            shortList = `${killerName}, ${extra[0]} e altri`;
        } else {
            shortList = nameList;
        }
        const templates = [
            `Tra ${nameList}, il cerchio si stringe. Osservate chi è più nervoso.`,
            `Qualcuno tra ${shortList} non dice tutta la verità. Ne sono certo.`,
            `Le mie osservazioni mi portano a sospettare di qualcuno tra ${shortList}. Ma chi?`,
            "Le vittime avevano tutte un collegamento con alcune delle persone che conosco. Pensateci bene.",
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    }

    // round >= 5
    const killerName = killerNames[0];
    const extra = shuffle_arr([...innocentNames]).slice(0, 2);
    let shortList;
    if (extra.length >= 2) {
        shortList = `${killerName}, ${extra[0]} o ${extra[1]}`;
    } else if (extra.length === 1) {
        shortList = `${killerName}, ${extra[0]} o qualcun altro tra chi conosco`;
    } else {
        shortList = nameList;
    }
    const templates = [
        `Posso restringere: tra ${shortList}. Uno di loro mente.`,
        `Dopo tutto quello che ho visto, il colpevole è tra ${shortList}.`,
        `Sono quasi certo: ${shortList}. Uno di questi ha le mani sporche.`,
        `Vi dico solo questo: guardate bene ${shortList}. La risposta è lì.`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
}

function shuffle_arr(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
