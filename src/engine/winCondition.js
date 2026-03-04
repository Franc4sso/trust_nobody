/**
 * WinConditionService translated from PHP.
 * Checks win conditions.
 */

/**
 * Check if game has a winner.
 * @param {Object} state - game state
 * @returns {string|null} 'citizens' | 'killers' | null
 */
export function checkWinCondition(state) {
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

    // Killers win if alive non-killer players <= alive killers
    const alivePlayers = (state.players ?? []).filter(p => p.is_alive);
    const aliveCitizens = alivePlayers.filter(p => p.role !== 'serial_killer').length;

    if (aliveCitizens <= aliveKillers) {
        return 'killers';
    }

    return null;
}
