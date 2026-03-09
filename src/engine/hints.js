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
// REGOLA FONDAMENTALE: un NPC puo' menzionare giocatori fuori dalle
// proprie connessioni SOLO se cita esplicitamente il bridge NPC
// (es. "Ho parlato con Elara..."). Senza bridge, solo proprie connessioni.
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

function weightedPick(generic, withNames, genericWeight = 0.3) {
    if (!withNames.length) return pick(generic);
    if (!generic.length) return pick(withNames);
    return Math.random() < genericWeight ? pick(generic) : pick(withNames);
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

// Merge own + borrowed names (used ONLY in bridge templates)
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

    // SOLO connessioni proprie, filtrate per giocatori vivi
    const connections = (npc.connections ?? []).filter(id => alivePlayerIds.includes(id));
    const connNames = connections.map(id => playerNames[id] ?? 'Sconosciuto');
    const killerIds = players.filter(p => p.role === 'serial_killer').map(p => p.id);
    const connKillerIds = connections.filter(id => killerIds.includes(id));
    const connInnocentIds = connections.filter(id => !killerIds.includes(id));

    const knowsKiller = connKillerIds.length > 0;

    // NPC minacciato
    if (isThreatened) {
        if (knowsKiller) {
            return innocentHint(state, npc, connNames, playerNames, round);
        }
        if (connInnocentIds.length === 0) {
            return innocentHint(state, npc, connNames, playerNames, round);
        }
        const shuffledInnocents = shuffle([...connInnocentIds]);
        const fakeKillerIds = [shuffledInnocents[0]];
        const fakeInnocentIds = shuffledInnocents.slice(1);
        return killerHint(state, npc, connNames, fakeKillerIds, fakeInnocentIds, playerNames, round);
    }

    // NPC inaffidabile (non minacciato): 40% di probabilita' di mentire.
    if (npc.unreliable && Math.random() < 0.4) {
        if (knowsKiller) {
            return innocentHint(state, npc, connNames, playerNames, round);
        }
        if (connInnocentIds.length > 0) {
            const shuffledInnocents = shuffle([...connInnocentIds]);
            const fakeKillerIds = [shuffledInnocents[0]];
            const fakeInnocentIds = shuffledInnocents.slice(1);
            return killerHint(state, npc, connNames, fakeKillerIds, fakeInnocentIds, playerNames, round);
        }
    }

    if (!knowsKiller) {
        return innocentHint(state, npc, connNames, playerNames, round);
    }

    return killerHint(state, npc, connNames, connKillerIds, connInnocentIds, playerNames, round);
}

// ── innocent NPC (no killer in connections) ──────────────────────────

function innocentHint(state, npc, connNames, playerNames, round) {
    const ownIds = new Set(
        (npc.connections ?? []).filter(id =>
            (state.players ?? []).find(p => p.id === id && p.is_alive))
    );
    const bridge = buildBridge(state, npc, playerNames, ownIds);

    // Propri nomi (senza borrowed)
    const nameList = shuffle([...connNames]).join(', ');
    // Expanded: propri + borrowed (SOLO per template bridge)
    const expanded = bridge && bridge.borrowedNames.length > 0
        ? expandNames(connNames, bridge.borrowedNames, 5)
        : null;
    const expandedList = expanded ? expanded.join(', ') : null;
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
        "Ho osservato chi potevo. Niente di strano, ma non abbassate la guardia.",
    ];
    if (connNames.length > 0) {
        early.push(
            `Le persone che conosco — ${nameList} — mi sembrano tutte a posto. Il pericolo e' altrove.`,
            `Ho osservato ${nameList} attentamente. Non mi sembrano pericolosi.`,
        );
    }
    // Bridge templates: citano esplicitamente l'NPC ponte
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

    // ── round 5+: sicurezza ──
    const late = [
        "Ormai ho osservato abbastanza. Il killer non e' tra le persone che frequento. Ne sono certo.",
        "Dopo tanti giri posso dirvi: cercate altrove. Chi conosco io non c'entra nulla.",
        "Sono sicuro di una cosa: il colpevole non e' tra i miei conoscenti. Guardate gli altri.",
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

    // Pool di nomi extra SOLO dalle proprie connessioni
    const ownExtraPool = shuffle([...innocentNames]);

    // expanded CON bridge (SOLO per template bridge)
    const expandedWithBridge = bridge && bridge.borrowedNames.length > 0
        ? expandNames(connNames, bridge.borrowedNames, 6)
        : null;
    const expandedWithBridgeList = expandedWithBridge ? expandedWithBridge.join(', ') : null;

    // expanded SENZA bridge (solo proprie connessioni)
    const expanded = shuffle([...connNames]);
    const expandedList = expanded.join(', ');

    // narrow: killer + fino a 3 innocenti dalle PROPRIE connessioni (usato mid)
    const narrowExtra = Math.min(innocentNames.length, 3);
    const narrow = shuffle([killerNames[0], ...shuffle([...innocentNames]).slice(0, narrowExtra)]);
    const narrowList = narrow.join(', ');

    // focused: killer + 1-2 innocenti (usato late)
    const focusedExtra = Math.min(innocentNames.length, 2);
    const focused = shuffle([killerNames[0], ...shuffle([...innocentNames]).slice(0, focusedExtra)]);
    const focusedList = focused.join(focused.length === 2 ? ' o ' : ', ');

    const bN = bridge?.bridgeNpc?.name;
    const hasBorrowed = bridge && bridge.borrowedNames.length > 0;

    // ── round 1-2: massima confusione, molti nomi, tono incerto ──
    // IMPORTANTE: nei primi turni, SEMPRE citare tutti i nomi possibili per non restringere il campo
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
    const earlyNamed = [];
    // Nei round 1-2 usiamo SEMPRE expanded (tutti i nomi), mai narrow
    if (hasBorrowed) {
        // Con bridge: tanti nomi, massima confusione
        earlyNamed.push(
            `Ho parlato con ${bN}. Tra i suoi conoscenti e i miei — ${expandedWithBridgeList} — c'e' qualcuno che nasconde qualcosa.`,
            `${bN} mi ha raccontato delle sue frequentazioni. Tra ${expandedWithBridgeList}, qualcuno non e' chi dice di essere.`,
            `Io e ${bN} conosciamo parecchia gente: ${expandedWithBridgeList}. Uno di loro mi mette a disagio.`,
            `Ho incrociato le voci con ${bN}. Tra ${expandedWithBridgeList}, qualcosa non torna. Ma e' presto per dire chi.`,
        );
    }
    // Sempre includere anche template con tutti i propri nomi
    earlyNamed.push(
        `Ho visto ${expandedList} aggirarsi la scorsa notte. Uno di loro nasconde qualcosa.`,
        `Tra le persone che conosco — ${expandedList} — qualcuno non e' chi dice di essere.`,
        `Conosco ${expandedList}. Uno di loro mi mette a disagio, ma non saprei dire chi.`,
        `${expandedList}... li osservo da un po'. C'e' qualcosa che non quadra in uno di loro.`,
    );
    if (!hasBorrowed && bN) {
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
            `Ho incrociato le mie informazioni con quelle di ${bN}. Tra ${expandedWithBridgeList} c'e' qualcuno di pericoloso.`,
        );
        midGeneric.push(
            `${bN} sa piu' di quanto dice. Incrociate le sue parole con le mie.`,
        );
    } else if (bN) {
        midGeneric.push(
            `Ho scambiato due parole con ${bN}. Mettete insieme i pezzi tra le nostre storie.`,
        );
    }

    // ── round 5+: piu' vicino alla verita' ──
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
            `Ho messo insieme tutto con ${bN}. Tra ${expandedWithBridgeList}, qualcosa non torna. Ma non mi sbilancio.`,
        );
    }

    // Round early: 50% generiche (senza nomi), 50% con nomi (ma TUTTI i nomi, non narrow)
    // Round mid/late: 70% frasi con nomi, 30% generiche
    if (round <= 2) {
        return weightedPick(earlyGeneric, earlyNamed, 0.5);
    }
    if (round <= 4) {
        return weightedPick(midGeneric, midNamed);
    }
    return weightedPick(lateGeneric, lateNamed);
}


