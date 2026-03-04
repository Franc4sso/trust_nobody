/**
 * GameStateMachine translated from PHP.
 * Manages game phase transitions.
 */

const PHASES = {
    SETUP: 'setup',
    ROLE_REVEAL: 'role_reveal',
    N1_INTRO: 'n1_intro',
    N1_VOTE: 'n1_vote',
    NIGHT: 'night',
    MORNING: 'morning',
    DAY: 'day',
    VOTE: 'vote',
    MEDIUM_REVEAL: 'medium_reveal',
    GAME_OVER: 'game_over',
};

/**
 * Advance to next phase in normal flow.
 * @param {Object} state - game state
 * @param {Function} winConditionChecker - function that returns 'citizens' | 'killers' | null
 * @returns {Object} {next: phase, shouldIncrementRound: boolean, updates: {}}
 */
export function advance(state, winConditionChecker) {
    const current = state.current_phase;
    let next = null;
    let shouldIncrementRound = false;
    const updates = {};

    switch (current) {
        case PHASES.SETUP:
            next = PHASES.ROLE_REVEAL;
            break;
        case PHASES.ROLE_REVEAL:
            next = PHASES.N1_INTRO;
            break;
        case PHASES.N1_INTRO:
            next = PHASES.N1_VOTE;
            break;
        case PHASES.N1_VOTE:
            next = PHASES.NIGHT;
            shouldIncrementRound = true;
            updates.analyst_night_decided = false;
            break;
        case PHASES.NIGHT:
            next = PHASES.MORNING;
            break;
        case PHASES.MORNING:
            next = PHASES.DAY;
            break;
        case PHASES.DAY:
            next = PHASES.VOTE;
            break;
        case PHASES.VOTE:
            next = afterVote(state, winConditionChecker);
            break;
        case PHASES.MEDIUM_REVEAL:
            next = afterMediumReveal(state, winConditionChecker);
            break;
        case PHASES.GAME_OVER:
            next = PHASES.GAME_OVER;
            break;
    }

    if (shouldIncrementRound) {
        updates.current_round = (state.current_round || 1) + 1;
    }

    return { next, updates };
}

/**
 * Determine phase after vote.
 */
function afterVote(state, winConditionChecker) {
    const winner = winConditionChecker(state);
    if (winner) {
        return PHASES.GAME_OVER;
    }

    const currentRound = state.rounds?.find(r => r.round_number === state.current_round);
    if (currentRound && currentRound.eliminated_player_id) {
        const hasMedium = (state.players ?? []).some(
            p => p.is_alive && p.role === 'medium'
        );
        if (hasMedium) {
            return PHASES.MEDIUM_REVEAL;
        }
    }

    return PHASES.NIGHT;
}

/**
 * Determine phase after medium reveal.
 */
function afterMediumReveal(state, winConditionChecker) {
    const winner = winConditionChecker(state);
    if (winner) {
        return PHASES.GAME_OVER;
    }

    return PHASES.NIGHT;
}

export { PHASES };
