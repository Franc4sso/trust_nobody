/**
 * NightResolutionService translated from PHP.
 * Resolves night actions (killer + guardian).
 * @param {Object} state - game state
 * @param {Array} nightActions - array of {action_type, actor_player_id, target_npc_id}
 * @returns {Object} {roundUpdate, npcUpdates} (immutable)
 */
export function resolveNight(state, nightActions) {
    const killerAction = nightActions.find(a => a.action_type === 'kill' || a.action_type === 'threaten');
    const guardianAction = nightActions.find(a => a.action_type === 'protect');

    const roundUpdate = {};
    const npcUpdates = {}; // Map of npc_id -> updates

    if (killerAction) {
        const targetNpcId = killerAction.target_npc_id;

        if (killerAction.action_type === 'kill') {
            roundUpdate.killer_action = 'kill';
            roundUpdate.killer_target_npc_id = targetNpcId;

            if (guardianAction && guardianAction.target_npc_id === targetNpcId) {
                roundUpdate.guardian_target_npc_id = guardianAction.target_npc_id;
                roundUpdate.kill_blocked = true;
            } else {
                if (guardianAction) {
                    roundUpdate.guardian_target_npc_id = guardianAction.target_npc_id;
                }
                npcUpdates[targetNpcId] = { is_alive: false };
            }
        } else if (killerAction.action_type === 'threaten') {
            roundUpdate.killer_action = 'threaten';
            roundUpdate.killer_target_npc_id = targetNpcId;

            if (guardianAction) {
                roundUpdate.guardian_target_npc_id = guardianAction.target_npc_id;
            }

            npcUpdates[targetNpcId] = { is_threatened: true };
        }
    }

    // Pick hint NPC — if threatened, the threatened NPC speaks (fuorviante)
    if (killerAction && killerAction.action_type === 'threaten') {
        roundUpdate.hint_npc_id = killerAction.target_npc_id;
    } else {
        const hintNpc = selectHintNpc(state);
        if (hintNpc) {
            roundUpdate.hint_npc_id = hintNpc.id;
        }
    }

    return { roundUpdate, npcUpdates };
}

function selectHintNpc(state) {
    const aliveNpcs = (state.npcs ?? []).filter(n => n.is_alive);
    if (aliveNpcs.length === 0) {
        return null;
    }

    // If only one NPC alive, must use it
    if (aliveNpcs.length === 1) {
        return aliveNpcs[0];
    }

    // Find the NPC that spoke last round
    const lastRoundNumber = state.rounds?.length > 0
        ? Math.max(...state.rounds.map(r => r.round_number))
        : state.current_round - 1;

    let lastHintNpcId = null;
    const lastRound = state.rounds?.find(r => r.round_number === lastRoundNumber - 1);
    if (lastRound && lastRound.hint_npc_id) {
        lastHintNpcId = lastRound.hint_npc_id;
    }

    // Exclude the NPC that spoke last round
    const candidates = aliveNpcs.filter(n => n.id !== lastHintNpcId);

    // Prefer NPCs that haven't spoken yet
    const usedNpcIds = (state.rounds ?? [])
        .filter(r => r.hint_npc_id)
        .map(r => r.hint_npc_id);
    const unused = candidates.filter(n => !usedNpcIds.includes(n.id));

    if (unused.length > 0) {
        return unused[Math.floor(Math.random() * unused.length)];
    }

    if (candidates.length > 0) {
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    return aliveNpcs[Math.floor(Math.random() * aliveNpcs.length)];
}
