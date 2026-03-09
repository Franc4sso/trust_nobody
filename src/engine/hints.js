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
            return innocentHint(state, npc, connNames, round);
        }
        if (connInnocentIds.length === 0) {
            return innocentHint(state, npc, connNames, round);
        }
        const shuffledInnocents = shuffle([...connInnocentIds]);
        const fakeKillerIds = [shuffledInnocents[0]];
        const fakeInnocentIds = shuffledInnocents.slice(1);
        return killerHint(state, npc, connNames, fakeKillerIds, fakeInnocentIds, playerNames, round);
    }

    // NPC inaffidabile (non minacciato): 40% di probabilita' di mentire.
    // Stessa logica del minacciato: inverte le informazioni.
    if (npc.unreliable && Math.random() < 0.4) {
        if (knowsKiller) {
            // Sa chi e' il killer ma mente → copre il killer
            return innocentHint(state, npc, connNames, round);
        }
        // Non conosce il killer ma mente → accusa innocenti
        if (connInnocentIds.length > 0) {
            const shuffledInnocents = shuffle([...connInnocentIds]);
            const fakeKillerIds = [shuffledInnocents[0]];
            const fakeInnocentIds = shuffledInnocents.slice(1);
            return killerHint(state, npc, connNames, fakeKillerIds, fakeInnocentIds, playerNames, round);
        }
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

    // Pool di nomi extra da connessioni (own innocents + borrowed)
    const extraPool = [...shuffle([...innocentNames])];
    if (bridge?.borrowedNames) {
        for (const n of bridge.borrowedNames) {
            if (!extraPool.includes(n)) extraPool.push(n);
        }
    }

    // expanded: killer nascosto nella folla, 4-6 nomi
    const expandedBase = bridge
        ? expandNames(connNames, bridge.borrowedNames, 6)
        : shuffle([...connNames]);
    // Assicura almeno 4 nomi
    if (expandedBase.length < 4) {
        for (const n of extraPool) {
            if (expandedBase.length >= 4) break;
            if (!expandedBase.includes(n)) expandedBase.push(n);
        }
    }
    const expanded = shuffle(expandedBase);

    // narrow: killer + innocenti + borrowed, minimo 4 nomi
    const narrowBase = [killerNames[0], ...shuffle([...innocentNames]).slice(0, 3)];
    if (narrowBase.length < 4 && bridge?.borrowedNames) {
        for (const n of bridge.borrowedNames) {
            if (narrowBase.length >= 4) break;
            if (!narrowBase.includes(n)) narrowBase.push(n);
        }
    }
    const narrow = shuffle(narrowBase);

    // focused: killer + extra, minimo 4 nomi sempre
    const minExtra = aliveCount <= 5 ? 4 : 3;
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
//
// L'analista riceve indizi progressivamente piu' forti:
//   round 1-2 (early): sensazioni generiche sui voti, atmosfera
//   round 3-4 (mid):   pattern di voto concreti, segnali su minacce NPC
//   round 5+  (late):  analisi incrociate voti + minacce, gruppi sospetti
//
// MAI puntare a un singolo sospetto. Sempre almeno 2-3 nomi o gruppi.
// ─────────────────────────────────────────────────────────────────────

export function generateAnalystBonus(state) {
    const round = state.current_round;
    const playerNames = Object.fromEntries(
        (state.players ?? []).map(p => [p.id, p.name])
    );
    const killerIds = (state.players ?? [])
        .filter(p => p.role === 'serial_killer')
        .map(p => p.id);
    const alive = (state.players ?? []).filter(p => p.is_alive);
    const aliveIds = alive.map(p => p.id);
    const allVotes = (state.votes ?? []).filter(
        v => aliveIds.includes(v.voter_player_id) && aliveIds.includes(v.target_player_id)
    );
    const rounds = state.rounds ?? [];

    // Raccolta hint per tier
    const early = [];
    const mid = [];
    const late = [];

    // ── ANALISI VOTI ──────────────────────────────────────────────────

    const votesByRound = {};
    for (const v of allVotes) {
        (votesByRound[v.round_number] ??= []).push(v);
    }

    // Mai bersagliati
    const allTargeted = {};
    for (const v of allVotes) {
        allTargeted[v.target_player_id] = (allTargeted[v.target_player_id] ?? 0) + 1;
    }
    const neverTargeted = alive.filter(p => !allTargeted[p.id]);
    if (neverTargeted.length >= 2 && neverTargeted.length <= 4) {
        const names = neverTargeted.map(p => p.name).join(', ');
        early.push(`Strano: ${names} non hanno mai ricevuto nemmeno un voto. Nessuno li sospetta... o nessuno osa accusarli?`);
        mid.push(`${names} continuano a non ricevere voti. E' sospetto che nessuno li abbia mai puntati.`);
    }

    // Cambio bersaglio ogni round
    const voterTargets = {};
    for (const v of allVotes) {
        (voterTargets[v.voter_player_id] ??= []).push(v.target_player_id);
    }
    const flipFloppers = [];
    for (const [voterId, targets] of Object.entries(voterTargets)) {
        if (targets.length >= 2 && new Set(targets).size === targets.length) {
            flipFloppers.push(playerNames[voterId] ?? '?');
        }
    }
    if (flipFloppers.length >= 2) {
        early.push(`${flipFloppers.join(' e ')} cambiano bersaglio ad ogni votazione. Comportamento nervoso o strategico?`);
        mid.push(`${flipFloppers.join(' e ')} non votano mai la stessa persona due volte. Stanno cercando di confondere le acque?`);
    } else if (flipFloppers.length === 1) {
        // Non puntare a uno solo: aggiungere un altro nome
        const other = alive.find(p => p.name !== flipFloppers[0]);
        if (other) {
            early.push(`Alcuni giocatori come ${flipFloppers[0]} e ${other.name} mostrano pattern di voto irregolari. Tenete d'occhio chi cambia idea troppo spesso.`);
        }
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
                mid.push(`${names} hanno votato insieme contro ${target}. Coincidenza o strategia?`);
                late.push(`C'e' un gruppo che vota in blocco: ${names}. Almeno uno di loro sta manipolando gli altri.`);
            }
        }
    }

    // Chi ha votato per eliminare un innocente
    for (const r of rounds) {
        if (!r.eliminated_player_id) continue;
        const eliminated = (state.players ?? []).find(p => p.id === r.eliminated_player_id);
        if (!eliminated || eliminated.role === 'serial_killer') continue;
        const pushers = allVotes
            .filter(v => v.round_number === r.round_number && !v.is_runoff && v.target_player_id === eliminated.id)
            .map(v => playerNames[v.voter_player_id] ?? '?');
        if (pushers.length >= 2) {
            mid.push(`${pushers.slice(0, 3).join(', ')} hanno spinto per eliminare ${eliminated.name}, che era innocente. Chi tra loro aveva interesse?`);
            late.push(`Ripensando all'eliminazione di ${eliminated.name}: ${pushers.slice(0, 3).join(', ')} l'hanno voluta fortemente. Almeno uno di loro sapeva cosa faceva.`);
        }
    }

    // Chi non ha mai votato un killer (e c'e' stato almeno 1 voto contro un killer)
    const killerVoters = new Set();
    for (const v of allVotes) {
        if (killerIds.includes(v.target_player_id)) {
            killerVoters.add(v.voter_player_id);
        }
    }
    if (killerVoters.size > 0) {
        const neverVotedKiller = alive.filter(p =>
            !killerIds.includes(p.id) && !killerVoters.has(p.id)
        );
        if (neverVotedKiller.length >= 2 && neverVotedKiller.length <= 4) {
            const names = neverVotedKiller.map(p => p.name).join(', ');
            late.push(`${names} non hanno mai votato contro chi si e' rivelato sospetto. Proteggono qualcuno o sono solo distratti?`);
        }
    }

    // ── ANALISI MINACCE NPC ───────────────────────────────────────────

    const threatenedRounds = rounds.filter(r => r.killer_action === 'threaten');
    const threatenedNpcIds = threatenedRounds.map(r => r.killer_target_npc_id);
    const threatenedNpcs = (state.npcs ?? []).filter(n => threatenedNpcIds.includes(n.id));
    const totalThreats = threatenedRounds.length;
    const killRounds = rounds.filter(r => r.killer_action === 'kill');

    if (totalThreats > 0) {
        // Early: sensazione vaga
        early.push(
            "Ho la sensazione che non tutti gli NPC stiano dicendo la verita'. Qualcuno potrebbe essere sotto pressione.",
            "Alcuni indizi degli NPC mi sembrano contraddittori. Come se qualcuno parlasse contro la propria volonta'.",
        );

        // Mid: piu' concreto, pattern minacce vs uccisioni
        if (totalThreats >= 2) {
            mid.push(
                `Il killer ha scelto di minacciare spesso invece di uccidere. Sta manipolando le informazioni che ricevete dagli NPC.`,
                `Ho contato: ${totalThreats} notti su ${rounds.length} con minacce invece di omicidi. Il killer preferisce il depistaggio alla violenza. Non fidatevi ciecamente degli indizi.`,
            );
        } else {
            mid.push(
                `C'e' stata almeno una notte in cui il killer ha scelto di non uccidere. Questo significa che almeno un indizio potrebbe essere stato manipolato.`,
                `Non tutte le notti il killer uccide. A volte preferisce controllare cosa dicono gli NPC. Riflettete su quali indizi vi hanno portato fuori strada.`,
            );
        }

        // Late: incrocio minacce + voti
        if (threatenedNpcs.length > 0) {
            const hintRounds = threatenedRounds.map(r => r.round_number);
            const suspiciousVoters = [];
            for (const hintRound of hintRounds) {
                const nextRoundVotes = allVotes.filter(v => v.round_number === hintRound);
                for (const v of nextRoundVotes) {
                    if (killerIds.includes(v.voter_player_id)) {
                        suspiciousVoters.push(v.voter_player_id);
                    }
                }
            }
            // Non rivelare chi, ma indicare il pattern
            late.push(
                `Ho incrociato le notti di minaccia con i voti del giorno dopo. Qualcuno sembra votare in modo piu' sicuro dopo le notti in cui il killer non ha ucciso. Come se sapesse gia' l'esito.`,
                `Dopo le notti senza omicidi, certi giocatori votano con piu' convinzione. Coincidenza? Il killer potrebbe usare le minacce per guidare le votazioni.`,
            );
        }

        // Late: pattern specifico su notti alterne
        if (totalThreats >= 2 && killRounds.length >= 1) {
            late.push(
                `Il killer alterna uccisioni e minacce. Nei turni dopo le minacce, gli indizi degli NPC puntano in direzioni strane. Confrontate gli indizi tra notti diverse: quelli che contraddicono gli altri potrebbero essere stati dati sotto costrizione.`,
            );
        }
    } else if (rounds.length >= 2) {
        // Nessuna minaccia rilevata
        mid.push(
            "Finora non ho motivo di credere che gli NPC siano stati manipolati. Gli indizi che avete ricevuto sembrano genuini.",
        );
        late.push(
            "Dopo tanti giri, gli NPC sembrano tutti parlare liberamente. Il killer preferisce uccidere piuttosto che manipolare. Fidatevi degli indizi.",
        );
    }

    // ── SELEZIONE PER ROUND ───────────────────────────────────────────

    const fallback = [
        "Le votazioni finora non rivelano schemi chiari. Qualcuno e' molto bravo a nascondersi nel voto.",
        "Ho analizzato ogni voto espresso... c'e' qualcuno che vota in modo strategico, ma non riesco ancora a capire chi.",
        "I pattern di voto sono confusi. Forse e' proprio questo il piano del killer: creare caos nelle assemblee.",
    ];

    if (round <= 2) {
        return early.length > 0 ? pick(early) : pick(fallback);
    }
    if (round <= 4) {
        // Mid: preferisci mid, fallback su early
        const pool = mid.length > 0 ? mid : early.length > 0 ? early : fallback;
        return pick(pool);
    }
    // Late: preferisci late, fallback su mid
    const pool = late.length > 0 ? late : mid.length > 0 ? mid : fallback;
    return pick(pool);
}
