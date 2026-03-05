/**
 * WinConditionService translated from PHP.
 * Checks win conditions.
 */

/**
 * Check if game has a winner.
 * @param {Object} state - game state
 * @param {boolean} afterAssembly - true when called after vote/assembly phase
 * @returns {string|null} 'citizens' | 'killers' | null
 */
export function checkWinCondition(state, afterAssembly = false) {
    const aliveKillers = (state.players ?? []).filter(p => p.is_alive && p.role === 'serial_killer').length;
    const aliveNpcs = (state.npcs ?? []).filter(n => n.is_alive).length;

    // Citizens win if all killers are eliminated
    if (aliveKillers === 0) {
        return 'citizens';
    }

    // Killers win if all NPCs are dead
    if (aliveNpcs === 0) {
        return 'killers';
    }

    // With only 1 NPC left, the guardian has no more targets to protect:
    // killers win after the assembly if they haven't been eliminated
    if (afterAssembly && aliveNpcs === 1) {
        return 'killers';
    }

    // Killers win if alive non-killer players <= alive killers
    const alivePlayers = (state.players ?? []).filter(p => p.is_alive);
    const aliveCitizens = alivePlayers.filter(p => p.role !== 'serial_killer').length;

    if (aliveCitizens <= aliveKillers) {
        return 'killers';
    }

    return null;
}
