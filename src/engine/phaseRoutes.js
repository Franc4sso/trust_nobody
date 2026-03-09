/**
 * Mapping from game phase to route path.
 */
export const PHASE_ROUTES = {
    setup: '/setup/names',
    role_reveal: '/roles',
    n1_intro: '/n1/intro',

    night: '/night',
    morning: '/morning/hint',
    day: '/day',
    vote: '/vote/panel',
    medium_reveal: '/vote/medium-reveal',
    game_over: '/game-over',
};

/**
 * Get the route for a given phase.
 * @param {string} phase - the game phase
 * @returns {string} the route path
 */
export function getRouteForPhase(phase) {
    return PHASE_ROUTES[phase] || '/';
}
