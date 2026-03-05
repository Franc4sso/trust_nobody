// ─────────────────────────────────────────────────────────────────────
// Hint Engine
//
// Genera indizi dinamici per gli NPC. Il sistema e' non-deterministico:
// innocent e killer-aware NPC usano gli stessi stili, cosi' il giocatore
// non puo' mai distinguerli dal tono. Pool separati per round bracket:
//   early (1-2)  → atmosfera, confusione, molti nomi
//   mid   (3-4)  → osservazione, cerchio si stringe
//   late  (5+)   → quasi certo, pochi nomi, diretto
//
// Il meccanismo "bridge" permette a qualsiasi NPC di prendere nomi reali
// dalle connessioni di un altro NPC e presentarli come info sentite.
// ─────────────────────────────────────────────────────────────────────

// ── utility ──────────────────────────────────────────────────────────

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function weightedPick(generic, withNames) {
    if (!withNames.length) return pick(generic);
    if (!generic.length) return pick(withNames);
    // 30% generic, 70% with names
    return Math.random() < 0.3 ? pick(generic) : pick(withNames);
}

function buildBridge(state, npc, playerNames, excludeIds) {
    const candidates = (state.npcs ?? []).filter(
        n => n.is_alive && n.id !== npc.id && (n.connections ?? []).length > 0
    );
    if (!candidates.length) return null;

    const bridgeNpc = pick(candidates);
    const aliveIds = new Set(
        (state.players ?? []).filter(p => p.is_alive).map(p => p.id)
    );
    const borrowedNames = shuffle(
        (bridgeNpc.connections ?? [])
            .filter(id => aliveIds.has(id) && !excludeIds.has(id))
            .map(id => playerNames[id])
            .filter(Boolean)
    );
    return { bridgeNpc, borrowedNames };
}

function expandNames(ownNames, borrowed, max) {
    const merged = [...ownNames];
    for (const n of borrowed) {
        if (merged.length >= max) break;
        merged.push(n);
    }
    return shuffle(merged);
}

// ── entry point ──────────────────────────────────────────────────────

export function generateHint(state, npc, isThreatened) {
    const round = state.current_round;
    const players = state.players ?? [];
    const alivePlayerIds = players.filter(p => p.is_alive).map(p => p.id);
    const playerNames = Object.fromEntries(players.map(p => [p.id, p.name]));

    const connections = (npc.connections ?? []).filter(id => alivePlayerIds.includes(id));
    const connNames = connections.map(id => playerNames[id] ?? 'Sconosciuto');
    const killerIds = players.filter(p => p.role === 'serial_killer').map(p => p.id);
    const connKillerIds = connections.filter(id => killerIds.includes(id));
    const connInnocentIds = connections.filter(id => !killerIds.includes(id));

    const knowsKiller = connKillerIds.length > 0;

    // NPC minacciato: stessi template, ma il contenuto informativo cambia.
    // Se conosce il killer → depista, trattato come innocente (punta altrove).
    // Se non conosce il killer → accusa innocenti con stesse frasi da "killer-aware"
    //   (cosi' il giocatore non distingue un NPC minacciato da uno normale).
    if (isThreatened) {
        if (knowsKiller) {
            // Conosce il killer ma e' minacciato → finge di non sapere, depista
            return innocentHint(state, npc, connNames, round);
        }
        // Non conosce il killer ma e' minacciato → accusa innocenti come se fossero sospetti
        // Se non ha connessioni innocenti, fa l'innocente anche lui
        if (connInnocentIds.length === 0) {
            return innocentHint(state, npc, connNames, round);
        }
        // Prende un innocente a caso come "finto killer" e gli altri come "finti innocenti"
        const shuffledInnocents = shuffle([...connInnocentIds]);
        const fakeKillerIds = [shuffledInnocents[0]];
        const fakeInnocentIds = shuffledInnocents.slice(1);
        return killerHint(state, npc, connNames, fakeKillerIds, fakeInnocentIds, playerNames, round);
    }

    if (!knowsKiller) {
        return innocentHint(state, npc, connNames, round);
    }

    return killerHint(state, npc, connNames, connKillerIds, connInnocentIds, playerNames, round);
}

// ── innocent NPC (no killer in connections) ──────────────────────────

function innocentHint(state, npc, connNames, round) {
    const playerNames = Object.fromEntries(
        (state.players ?? []).map(p => [p.id, p.name])
    );
    const ownIds = new Set(
        (npc.connections ?? []).filter(id =>
            (state.players ?? []).find(p => p.id === id && p.is_alive))
    );
    const bridge = buildBridge(state, npc, playerNames, ownIds);

    const nameList = shuffle([...connNames]).join(', ');
    const expanded = bridge
        ? expandNames(connNames, bridge.borrowedNames, 5)
        : shuffle([...connNames]);
    const expandedList = expanded.join(', ');
    const bN = bridge?.bridgeNpc?.name;
    const hasBorrowed = bridge && bridge.borrowedNames.length > 0;

    // ── round 1-2: sensazioni, atmosfera ──
    const early = [
        "Qualcosa non va in questo posto. Ma non saprei dirvi cosa di preciso.",
        "Ho le mie ragioni per stare all'erta. Se fossi in voi, non mi fiderei delle apparenze.",
        "La notte scorsa ho sentito dei rumori. Probabilmente niente, ma... state attenti.",
        "C'e' tensione nell'aria. Non so da dove venga, ma la sento.",
        "Non ho notato nulla di sospetto tra chi conosco. Ma qualcosa nell'aria e' cambiato.",
        "Le persone che frequento mi sembrano a posto. Il pericolo viene da altrove.",
        "Cercate tra chi non conosco. Il pericolo non viene dalla mia cerchia.",
        // infiltrato mid (a volte un NPC innocente sembra gia' sicuro al round 1)
        "Ho osservato chi potevo. Niente di strano, ma non abbassate la guardia.",
    ];
    if (connNames.length > 0) {
        early.push(
            `Le persone che conosco — ${nameList} — mi sembrano tutte a posto. Il pericolo e' altrove.`,
            `Ho osservato ${nameList} attentamente. Non mi sembrano pericolosi.`,
        );
    }
    if (hasBorrowed) {
        early.push(
            `Ho parlato con ${bN}. Tra i suoi e i miei conoscenti — ${expandedList} — nessuno mi sembra sospetto. Ma qualcuno qui mente.`,
            `Io e ${bN} conosciamo abbastanza gente: ${expandedList}. Nessuno di loro mi preoccupa. Il pericolo e' altrove.`,
        );
    } else if (bN) {
        early.push(
            `Ho parlato con ${bN}. Anche lui non ha notato nulla. Il killer si nasconde bene.`,
        );
    }

    // ── round 3-4: piu' osservazione, voti ──
    const mid = [
        "Ho osservato chi potevo. Niente di strano, ma non abbassate la guardia.",
        "Tra i miei conoscenti non ho visto nulla di anomalo. Ma il killer e' furbo.",
        "Le votazioni mi hanno fatto pensare. Qualcuno tra voi sta giocando sporco.",
        "Il killer e' qualcuno che si nasconde bene. E non tra le persone che frequento io.",
        "Potrei sbagliarmi, ma credo che il colpevole sia qualcuno che nessuno sospetta.",
        // infiltrato early (a volte un NPC torna vago)
        "C'e' tensione nell'aria. Non so da dove venga, ma la sento.",
        "La notte scorsa ho sentito di nuovo dei rumori. Non mi sento al sicuro.",
    ];
    if (connNames.length > 0) {
        mid.push(
            `${nameList}... li conosco bene, non credo siano coinvolti. Il killer e' qualcun altro.`,
            `Ho notato tensione durante le votazioni. Ma tra chi conosco — ${nameList} — nessuno mi sembra il colpevole.`,
        );
    }
    if (hasBorrowed) {
        mid.push(
            `${bN} mi ha raccontato di alcune persone. Tra ${expandedList}, non ho visto nulla di strano. Ma il killer e' furbo.`,
            `Ho incrociato le mie informazioni con ${bN}. Tra ${expandedList} mi sembra tutto tranquillo. Il pericolo e' altrove.`,
        );
    } else if (bN) {
        mid.push(
            `${bN} la pensa come me: tra chi conosciamo non c'e' nulla di strano. Eppure qualcuno mente.`,
        );
    }

    // ── round 5+: sicurezza, ma a volte ancora dubbio ──
    const late = [
        "Ormai ho osservato abbastanza. Il killer non e' tra le persone che frequento. Ne sono certo.",
        "Dopo tanti giri posso dirvi: cercate altrove. Chi conosco io non c'entra nulla.",
        "Sono sicuro di una cosa: il colpevole non e' tra i miei conoscenti. Guardate gli altri.",
        // infiltrati mid/early (anche a round 5 un NPC puo' sembrare insicuro)
        "Potrei sbagliarmi, ma credo che il colpevole sia qualcuno che nessuno sospetta.",
        "Ho le mie ragioni per stare all'erta. Ma tra chi conosco non ho trovato nulla.",
    ];
    if (connNames.length > 0) {
        late.push(
            `Posso dirlo con certezza: ${nameList} non c'entrano. Il killer e' qualcun altro.`,
            `Ho passato abbastanza tempo con ${nameList}. Nessuno di loro e' il killer. Cercate altrove.`,
        );
    }
    if (hasBorrowed) {
        late.push(
            `Io e ${bN} abbiamo messo insieme i pezzi. Tra ${expandedList} e' tutto pulito. Il killer si nasconde tra gli altri.`,
        );
    }

    const pool = round <= 2 ? early : round <= 4 ? mid : late;
    return pick(pool);
}

// ── killer-aware NPC ─────────────────────────────────────────────────

function killerHint(state, npc, connNames, connKillerIds, connInnocentIds, playerNames, round) {
    const killerNames = connKillerIds.map(id => playerNames[id]);
    const innocentNames = connInnocentIds.map(id => playerNames[id]);
    const ownIds = new Set([...connKillerIds, ...connInnocentIds]);
    const bridge = buildBridge(state, npc, playerNames, ownIds);

    // Quanti giocatori vivi ci sono? Piu' siamo vicini all'endgame, piu' nomi
    // servono nel focused per non regalare la partita ai cittadini.
    // (Se killer == cittadini dopo l'assemblea, vincono i killer.)
    const alivePlayers = (state.players ?? []).filter(p => p.is_alive);
    const aliveCount = alivePlayers.length;

    // expanded: own + borrowed, killer nascosto nella folla (3-5 nomi)
    const expanded = bridge
        ? expandNames(connNames, bridge.borrowedNames, 5)
        : shuffle([...connNames]);
    // narrow: killer + fino a 2 innocenti (2-3 nomi)
    const narrow = shuffle([killerNames[0], ...shuffle([...innocentNames]).slice(0, 2)]);

    // focused: minimo 3 nomi sempre. In endgame (<=5 vivi) minimo 4 per non
    // rendere l'hint troppo rivelatore quando un voto sbagliato = vittoria killer.
    const minExtra = aliveCount <= 5 ? 3 : 2;
    const extraPool = [...shuffle([...innocentNames])];
    if (bridge?.borrowedNames) {
        for (const n of bridge.borrowedNames) {
            if (!extraPool.includes(n)) extraPool.push(n);
        }
    }
    const focusedExtra = extraPool.slice(0, minExtra);
    const focused = shuffle([killerNames[0], ...focusedExtra]);

    const expandedList = expanded.join(', ');
    const narrowList = narrow.join(', ');
    const focusedList = focused.join(focused.length === 2 ? ' o ' : ', ');
    const bN = bridge?.bridgeNpc?.name;
    const hasBorrowed = bridge && bridge.borrowedNames.length > 0;

    // ── round 1-2: massima confusione, molti nomi, tono incerto ──
    const earlyGeneric = [
        "Qualcosa non va in questo posto. Ho visto cose di notte che non dovrei aver visto.",
        "C'e' qualcuno qui che non e' quello che sembra. Ma non posso dire di piu', non ancora.",
        "Non mi fido di nessuno qui. Ho visto un'espressione su un volto che mi ha gelato il sangue.",
        "La notte scorsa ho sentito dei passi. Qualcuno si muove nell'ombra.",
        "Ho le mie ragioni per stare all'erta. Se fossi in voi, non mi fiderei delle apparenze.",
        "Conosco poche persone qui, ma quel poco che ho visto mi basta. Qualcuno mente.",
        "Le apparenze ingannano. Ho visto poco ma abbastanza per capire che qui nessuno e' al sicuro.",
        "So poco, ma so che qualcuno tra voi ha qualcosa da nascondere.",
    ];
    const earlyNamed = [
        `Ho visto ${expandedList} aggirarsi la scorsa notte. Uno di loro nasconde qualcosa.`,
        `Tra le persone che conosco — ${expandedList} — qualcuno non e' chi dice di essere.`,
        `Conosco ${expandedList}. Uno di loro mi mette a disagio, ma non saprei dire chi.`,
        `${expandedList}... li osservo da un po'. C'e' qualcosa che non quadra in uno di loro.`,
    ];
    if (hasBorrowed) {
        earlyNamed.push(
            `Ho parlato con ${bN}. Tra i suoi conoscenti e i miei — ${expandedList} — c'e' qualcuno che nasconde qualcosa.`,
            `${bN} mi ha raccontato delle sue frequentazioni. Tra ${expandedList}, qualcuno non e' chi dice di essere.`,
            `Io e ${bN} conosciamo parecchia gente: ${expandedList}. Uno di loro mi mette a disagio.`,
        );
    } else if (bN) {
        earlyGeneric.push(
            `Ho scambiato due parole con ${bN}. Mettete insieme le nostre storie, qualcosa non torna.`,
            `Se volete capirci qualcosa, parlate anche con ${bN}. Tra noi due conosciamo abbastanza gente.`,
        );
    }

    // ── round 3-4: cerchio si stringe, lista piu' corta ──
    const midGeneric = [
        "Ho osservato chi potevo. Il killer e' furbo — si nasconde bene tra la gente.",
        "Le votazioni dell'ultimo turno mi hanno fatto pensare. Qualcuno tra voi sta giocando sporco.",
        "Ho osservato i voti. C'e' chi vota in modo strategico. Fate attenzione.",
        "Comincio a capire chi e'. Ma ho bisogno di un altro giro per esserne sicuro.",
        "So qualcosa che potrebbe cambiare tutto. Ma devo essere sicuro prima di parlare.",
        "Le vittime avevano tutte un collegamento con alcune delle persone che conosco. Pensateci bene.",
        "La notte scorsa ho sentito dei passi. Qualcuno si muove nell'ombra. Non so piu' cosa pensare.",
    ];
    const midNamed = [
        `Qualcuno tra ${narrowList} non dice tutta la verita'. Ne sono certo.`,
        `Le mie osservazioni mi portano a sospettare di qualcuno tra ${narrowList}. Ma chi?`,
        `Tra ${narrowList}, il cerchio si stringe. Osservate chi e' piu' nervoso.`,
        `${expandedList}... troppi volti, troppe storie. Ma uno di loro non e' chi dice di essere.`,
    ];
    if (hasBorrowed) {
        midNamed.push(
            `Ho incrociato le mie informazioni con quelle di ${bN}. Tra ${expandedList} c'e' qualcuno di pericoloso.`,
        );
        midGeneric.push(
            `${bN} sa piu' di quanto dice. Incrociate le sue parole con le mie.`,
        );
    } else if (bN) {
        midGeneric.push(
            `Ho scambiato due parole con ${bN}. Mettete insieme i pezzi tra le nostre storie.`,
        );
    }

    // ── round 5+: piu' vicino alla verita', ma mai certezza assoluta ──
    const lateGeneric = [
        "Il cerchio si stringe. Ho un sospetto forte ma non voglio accusare la persona sbagliata.",
        "Non escludete nessuno. Il killer potrebbe essere l'ultimo che sospettate.",
        "Attenti a chi sembra piu' innocente. E' spesso cosi' che funziona.",
        "Ho le idee piu' chiare ma non abbastanza. State attenti a tutti, specialmente a chi vi sembra pulito.",
        "Le votazioni mi hanno fatto cambiare idea. Forse il colpevole e' piu' furbo di quanto pensassi.",
    ];
    const lateNamed = [
        `Ho dei sospetti su ${focusedList}. Ma potrei sbagliarmi. Osservateli voi stessi.`,
        `Dopo tutto quello che ho visto, guarderei con attenzione ${focusedList}. Uno di loro non e' pulito.`,
        `Se dovessi scommettere, direi ${focusedList}. Ma in questo posto nessuno e' davvero al sicuro.`,
        `C'e' qualcosa che non quadra in ${focusedList}. Non posso esserne certo, ma il mio istinto non mente.`,
        `Qualcuno tra ${narrowList} gioca sporco. Ma ho paura di accusare il sbagliato.`,
    ];
    if (hasBorrowed) {
        lateNamed.push(
            `Ho messo insieme tutto con ${bN}. Tra ${focusedList}, qualcosa non torna. Ma non mi sbilancio.`,
        );
    }

    // Round early: pick uniforme (confusione voluta)
    // Round mid/late: 70% frasi con nomi, 30% generiche
    if (round <= 2) {
        return pick([...earlyGeneric, ...earlyNamed]);
    }
    if (round <= 4) {
        return weightedPick(midGeneric, midNamed);
    }
    return weightedPick(lateGeneric, lateNamed);
}


// ── analyst bonus ────────────────────────────────────────────────────

export function generateAnalystBonus(state) {
    const playerNames = Object.fromEntries(
        (state.players ?? []).map(p => [p.id, p.name])
    );
    const killerIds = (state.players ?? [])
        .filter(p => p.role === 'serial_killer')
        .map(p => p.id);
    const aliveIds = (state.players ?? [])
        .filter(p => p.is_alive)
        .map(p => p.id);
    const allVotes = (state.votes ?? []).filter(
        v => aliveIds.includes(v.voter_player_id) && aliveIds.includes(v.target_player_id)
    );

    return analyzeVotePatterns(state, playerNames, killerIds, allVotes) ?? pick([
        "Le votazioni finora non rivelano schemi chiari. Qualcuno e' molto bravo a nascondersi nel voto.",
        "Ho analizzato ogni voto espresso... c'e' qualcuno che vota sempre in modo strategico, ma non riesco ancora a capire chi.",
        "I pattern di voto sono confusi. Forse e' proprio questo il piano del killer: creare caos nelle assemblee.",
    ]);
}

function analyzeVotePatterns(state, playerNames, killerIds, allVotes) {
    if (!allVotes.length) return null;

    // Raccogli pattern con priorita': high (coinvolgono killer), low (generici)
    const high = [];
    const low = [];

    // Voti raggruppati per round
    const votesByRound = {};
    for (const v of allVotes) {
        (votesByRound[v.round_number] ??= []).push(v);
    }

    // Chi ha votato insieme contro lo stesso bersaglio (killer + innocente)
    for (const roundVotes of Object.values(votesByRound)) {
        const byTarget = {};
        for (const v of roundVotes) {
            (byTarget[v.target_player_id] ??= []).push(v.voter_player_id);
        }
        for (const [targetId, voterIds] of Object.entries(byTarget)) {
            if (voterIds.length < 2) continue;
            const hasKiller = voterIds.some(id => killerIds.includes(id));
            const hasInnocent = voterIds.some(id => !killerIds.includes(id));
            if (hasKiller && hasInnocent) {
                const names = voterIds.slice(0, 3).map(id => playerNames[id] ?? '?').join(' e ');
                const target = playerNames[targetId] ?? '?';
                high.push(`Ho notato che ${names} hanno votato insieme contro ${target}. Coincidenza o strategia?`);
            }
        }
    }

    // Chi ha votato per eliminare un innocente
    for (const r of (state.rounds ?? [])) {
        if (!r.eliminated_player_id) continue;
        const eliminated = (state.players ?? []).find(p => p.id === r.eliminated_player_id);
        if (!eliminated || eliminated.role === 'serial_killer') continue;
        const pushers = allVotes
            .filter(v => v.round_number === r.round_number && !v.is_runoff && v.target_player_id === eliminated.id)
            .map(v => playerNames[v.voter_player_id] ?? '?');
        if (pushers.length >= 2) {
            high.push(`${pushers.slice(0, 3).join(', ')} hanno spinto per eliminare ${eliminated.name}, che era innocente. Chi di loro aveva interesse a farlo fuori?`);
        }
    }

    // Mai bersagliati
    const allTargeted = {};
    for (const v of allVotes) {
        allTargeted[v.target_player_id] = (allTargeted[v.target_player_id] ?? 0) + 1;
    }
    const alive = (state.players ?? []).filter(p => p.is_alive);
    const neverTargeted = alive.filter(p => !allTargeted[p.id]);
    if (neverTargeted.length >= 1 && neverTargeted.length <= 3) {
        const names = neverTargeted.map(p => p.name).join(', ');
        low.push(`Strano: ${names} non ha mai ricevuto nemmeno un voto. Nessuno li sospetta... o nessuno osa accusarli?`);
    }

    // Cambio bersaglio ogni round
    const voterTargets = {};
    for (const v of allVotes) {
        (voterTargets[v.voter_player_id] ??= []).push(v.target_player_id);
    }
    for (const [voterId, targets] of Object.entries(voterTargets)) {
        if (targets.length >= 2 && new Set(targets).size === targets.length) {
            const voterName = playerNames[voterId] ?? '?';
            const others = Object.keys(voterTargets).filter(id => id !== voterId);
            const otherName = others.length > 0 ? playerNames[pick(others)] : null;
            if (otherName) {
                low.push(`${voterName} cambia bersaglio ad ogni votazione. Anche ${otherName} si comporta in modo strano durante i voti.`);
            } else {
                low.push(`${voterName} cambia bersaglio ad ogni votazione. Un comportamento del genere e' sospetto.`);
            }
        }
    }

    // Restituisci il pattern piu' forte disponibile
    if (high.length) return pick(high);
    if (low.length) return pick(low);
    return null;
}
