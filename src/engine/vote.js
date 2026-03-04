/**
 * VoteService translated from PHP.
 * Handles vote tallying and elimination.
 */

/**
 * Tally votes and return result.
 * @param {Object} state - game state
 * @param {boolean} isRunoff - whether this is a runoff vote
 * @returns {Object} {eliminated: player|null, runoff: player[]|null, counts: {player_id: count}}
 */
export function tally(state, isRunoff = false) {
    const votes = (state.votes ?? []).filter(v => v.round_number === state.current_round && v.is_runoff === isRunoff);

    const counts = {};
    for (const v of votes) {
        const tid = v.target_player_id;
        counts[tid] = (counts[tid] ?? 0) + 1;
    }

    // Sort by vote count descending
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    if (sorted.length === 0) {
        return { eliminated: null, runoff: null, counts: {} };
    }

    const maxVotes = sorted[0][1];
    const topPlayerIds = sorted.filter(([, count]) => count === maxVotes).map(([id]) => id);

    // If tie and not already a runoff, trigger runoff
    if (topPlayerIds.length > 1 && !isRunoff) {
        const runoffPlayers = topPlayerIds
            .map(id => state.players.find(p => p.id === id))
            .filter(Boolean);
        return {
            eliminated: null,
            runoff: runoffPlayers,
            counts: Object.fromEntries(sorted),
        };
    }

    // Eliminate the player with most votes (in runoff tie, pick randomly)
    const eliminatedId = topPlayerIds[Math.floor(Math.random() * topPlayerIds.length)];
    const eliminated = state.players.find(p => p.id === eliminatedId);

    return {
        eliminated,
        runoff: null,
        counts: Object.fromEntries(sorted),
    };
}

/**
 * Check if all eligible voters have cast their vote.
 * @param {Object} state - game state
 * @param {boolean} isRunoff - whether checking runoff votes
 * @param {Array<string>} [eligibleVoterIds] - if provided, only check these voters
 * @returns {boolean}
 */
export function allVotesCast(state, isRunoff = false, eligibleVoterIds = null) {
    const voters = eligibleVoterIds ?? state.players
        .filter(p => p.is_alive)
        .map(p => p.id);

    const votes = (state.votes ?? []).filter(
        v => v.round_number === state.current_round && v.is_runoff === isRunoff
    );

    return votes.length >= voters.length;
}
