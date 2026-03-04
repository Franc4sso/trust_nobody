import { NPC_ARCHETYPES, NPC_COUNT, CONNECTION_TEMPLATES } from './archetypes';

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDescriptionsFromTemplates(personality, connectedPlayers) {
    const templates = shuffle(CONNECTION_TEMPLATES[personality] ?? CONNECTION_TEMPLATES['elder']);
    return connectedPlayers.map((player, i) => ({
        player_id: player.id,
        text: templates[i % templates.length].replace('{name}', player.name),
    }));
}

async function generateDescriptionsWithAI(archetype, connectedPlayers) {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey || apiKey === 'inserisci_qui') return null;

    const namesStr = connectedPlayers.map((p) => p.name).join(', ');
    const prompt = `Sei ${archetype.name}, un personaggio in un gioco sociale di deduzione ambientato in un villaggio medievale.
Il tuo ruolo è: ${archetype.personality}.
La tua storia: ${archetype.backstory}

Devi descrivere brevemente come conosci ognuna di queste persone del villaggio: ${namesStr}.

Regole:
- Una frase per persona, in prima persona, in italiano
- Tono misterioso e leggermente inquietante, coerente col tuo ruolo
- Non rivelare se qualcuno è colpevole o innocente
- Rispondi SOLO con un oggetto JSON, senza markdown, nel formato:
{"nome_persona": "descrizione", ...}`;

    try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.8,
                max_tokens: 400,
            }),
        });

        if (!res.ok) return null;

        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content ?? '';
        const decoded = JSON.parse(text);

        if (typeof decoded !== 'object' || Array.isArray(decoded)) return null;

        const result = [];
        for (const player of connectedPlayers) {
            const desc = decoded[player.name];
            if (!desc) return null;
            result.push({ player_id: player.id, text: desc });
        }
        return result;
    } catch {
        return null;
    }
}

// Connection count ranges scaled by player count
const CONNECTION_RANGE = {
    4:  [1, 2],
    5:  [1, 2],
    6:  [2, 3],
    7:  [2, 3],
    8:  [2, 3],
    9:  [2, 3],
    10: [2, 4],
};

/**
 * Build a balanced connection map ensuring:
 * 1. Every player is known by at least one NPC
 * 2. At least one NPC knows a killer
 * 3. Connections are proportional to player count
 */
function buildConnectionMap(archetypes, players, killerIds) {
    const npcCount = archetypes.length;
    const [minConn, maxConn] = CONNECTION_RANGE[players.length] ?? [2, 3];

    // Track how many NPCs know each player
    const playerCoverage = new Map(players.map(p => [p.id, 0]));
    // Track which NPC indices know a killer
    let killerCovered = false;

    // Generate initial random connections per NPC
    const connectionMap = archetypes.map(() => new Set());

    for (let i = 0; i < npcCount; i++) {
        const connCount = randInt(minConn, maxConn);
        const shuffled = shuffle(players);
        for (let j = 0; j < connCount && j < shuffled.length; j++) {
            connectionMap[i].add(shuffled[j].id);
            playerCoverage.set(shuffled[j].id, (playerCoverage.get(shuffled[j].id) ?? 0) + 1);
        }
        if ([...connectionMap[i]].some(id => killerIds.includes(id))) {
            killerCovered = true;
        }
    }

    // Ensure every player is known by at least one NPC
    for (const [playerId, count] of playerCoverage) {
        if (count === 0) {
            // Add to the NPC with fewest connections
            let bestIdx = 0;
            let bestSize = Infinity;
            for (let i = 0; i < npcCount; i++) {
                if (connectionMap[i].size < bestSize) {
                    bestSize = connectionMap[i].size;
                    bestIdx = i;
                }
            }
            connectionMap[bestIdx].add(playerId);
            if (killerIds.includes(playerId)) killerCovered = true;
        }
    }

    // Ensure at least one NPC knows a killer
    if (!killerCovered && killerIds.length > 0) {
        const killerId = killerIds[Math.floor(Math.random() * killerIds.length)];
        // Pick NPC with fewest connections
        let bestIdx = 0;
        let bestSize = Infinity;
        for (let i = 0; i < npcCount; i++) {
            if (connectionMap[i].size < bestSize) {
                bestSize = connectionMap[i].size;
                bestIdx = i;
            }
        }
        connectionMap[bestIdx].add(killerId);
    }

    return connectionMap;
}

/**
 * Generate NPCs for the game. Async because of optional Groq call.
 * @param {Array} players - array of player objects with id, name
 * @param {Array} [killerIds] - ids of killer players (for balanced connections)
 * @returns {Promise<Array>} npcs
 */
export async function generateNpcs(players, killerIds = []) {
    const count = NPC_COUNT[players.length] ?? 4;
    const archetypes = shuffle([...NPC_ARCHETYPES]).slice(0, count);
    const connectionMap = buildConnectionMap(archetypes, players, killerIds);
    const npcs = [];

    for (let i = 0; i < archetypes.length; i++) {
        const archetype = archetypes[i];
        const connectedPlayerIds = [...connectionMap[i]];
        const connectedPlayers = connectedPlayerIds.map(id => players.find(p => p.id === id)).filter(Boolean);

        const connectionDescriptions =
            (await generateDescriptionsWithAI(archetype, connectedPlayers)) ??
            generateDescriptionsFromTemplates(archetype.personality, connectedPlayers);

        npcs.push({
            id: crypto.randomUUID(),
            name: archetype.name,
            personality: archetype.personality,
            backstory: archetype.backstory,
            connections: connectedPlayerIds,
            connection_descriptions: connectionDescriptions,
            is_alive: true,
            is_threatened: false,
        });
    }

    return npcs;
}
