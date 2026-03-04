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

/**
 * Generate NPCs for the game. Async because of optional Groq call.
 * @param {Array} players - array of player objects with id, name
 * @returns {Promise<Array>} npcs
 */
export async function generateNpcs(players) {
    const count = NPC_COUNT[players.length] ?? 4;
    const archetypes = shuffle([...NPC_ARCHETYPES]).slice(0, count);
    const npcs = [];

    for (const archetype of archetypes) {
        const shuffledPlayers = shuffle(players);
        const connCount = randInt(2, Math.min(4, shuffledPlayers.length));
        const connectedPlayers = shuffledPlayers.slice(0, connCount);
        const connections = connectedPlayers.map((p) => p.id);

        const connectionDescriptions =
            (await generateDescriptionsWithAI(archetype, connectedPlayers)) ??
            generateDescriptionsFromTemplates(archetype.personality, connectedPlayers);

        npcs.push({
            id: crypto.randomUUID(),
            name: archetype.name,
            personality: archetype.personality,
            backstory: archetype.backstory,
            connections,
            connection_descriptions: connectionDescriptions,
            is_alive: true,
            is_threatened: false,
        });
    }

    return npcs;
}
