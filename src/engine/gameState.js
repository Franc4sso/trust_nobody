import React, { createContext, useReducer, useContext, useEffect } from 'react';

const STORAGE_KEY = 'trust_nobody_game';

// Initial state
const initialState = {
    id: null,
    player_count: 0,
    current_phase: 'setup',
    current_round: 0,
    winner: null,
    analyst_used: false,
    analyst_used_ever: false,
    analyst_night_decided: false,
    runoff_active: false,
    runoff_player_ids: [],
    players: [],
    npcs: [],
    rounds: [],
    night_actions: [],
    votes: [],
};

// Context
const GameContext = createContext(null);

// Action types
const ACTIONS = {
    INIT_GAME: 'INIT_GAME',
    SET_PLAYERS: 'SET_PLAYERS',
    SET_NPCS: 'SET_NPCS',
    SET_PHASE_AND_ROUND: 'SET_PHASE_AND_ROUND',
    UPDATE_PLAYER: 'UPDATE_PLAYER',
    UPDATE_NPC: 'UPDATE_NPC',
    ADD_VOTE: 'ADD_VOTE',
    ADD_NIGHT_ACTION: 'ADD_NIGHT_ACTION',
    RESOLVE_NIGHT: 'RESOLVE_NIGHT',
    SET_WINNER: 'SET_WINNER',
    UPDATE_ROUND: 'UPDATE_ROUND',
    SET_RUNOFF: 'SET_RUNOFF',
    RESET: 'RESET',
    LOAD_FROM_STORAGE: 'LOAD_FROM_STORAGE',
};

// Reducer
function gameReducer(state, action) {
    switch (action.type) {
        case ACTIONS.INIT_GAME:
            return {
                ...initialState,
                id: crypto.randomUUID(),
            };

        case ACTIONS.SET_PLAYERS:
            return {
                ...state,
                players: action.payload,
                player_count: action.payload.length,
            };

        case ACTIONS.SET_NPCS:
            return {
                ...state,
                npcs: action.payload,
            };

        case ACTIONS.SET_PHASE_AND_ROUND: {
            const newState = { ...state };
            if (action.payload.phase !== undefined) {
                newState.current_phase = action.payload.phase;
            }
            if (action.payload.round !== undefined) {
                newState.current_round = action.payload.round;
            }
            if (action.payload.current_round !== undefined) {
                newState.current_round = action.payload.current_round;
            }
            // Reset runoff state when entering a new night (new round)
            if (action.payload.phase === 'night') {
                newState.runoff_active = false;
                newState.runoff_player_ids = [];
            }
            return newState;
        }

        case ACTIONS.UPDATE_PLAYER: {
            const players = state.players.map(p =>
                p.id === action.payload.id
                    ? { ...p, ...action.payload.updates }
                    : p
            );
            return { ...state, players };
        }

        case ACTIONS.UPDATE_NPC: {
            const npcs = state.npcs.map(n =>
                n.id === action.payload.id
                    ? { ...n, ...action.payload.updates }
                    : n
            );
            return { ...state, npcs };
        }

        case ACTIONS.ADD_VOTE:
            return {
                ...state,
                votes: [...state.votes, action.payload],
            };

        case ACTIONS.ADD_NIGHT_ACTION:
            return {
                ...state,
                night_actions: [...state.night_actions, action.payload],
            };

        case ACTIONS.RESOLVE_NIGHT: {
            const { roundUpdate, npcUpdates } = action.payload;
            
            // Update NPCs
            let npcs = state.npcs.map(n =>
                npcUpdates[n.id]
                    ? { ...n, ...npcUpdates[n.id] }
                    : n
            );

            // Create or update round
            let rounds = state.rounds || [];
            const roundIndex = rounds.findIndex(r => r.round_number === state.current_round);

            if (roundIndex >= 0) {
                rounds[roundIndex] = { ...rounds[roundIndex], ...roundUpdate };
            } else {
                rounds.push({
                    id: crypto.randomUUID(),
                    round_number: state.current_round,
                    ...roundUpdate,
                });
            }

            // Clear night actions for this round
            const night_actions = state.night_actions.filter(
                na => na.round_number !== state.current_round
            );

            return {
                ...state,
                npcs,
                rounds,
                night_actions,
            };
        }

        case ACTIONS.UPDATE_ROUND: {
            const rounds = state.rounds.map(r =>
                r.round_number === action.payload.round_number
                    ? { ...r, ...action.payload.updates }
                    : r
            );
            return { ...state, rounds };
        }

        case ACTIONS.SET_RUNOFF:
            return {
                ...state,
                runoff_active: action.payload.active,
                runoff_player_ids: action.payload.player_ids || [],
            };

        case ACTIONS.SET_WINNER:
            return {
                ...state,
                winner: action.payload,
                current_phase: 'game_over',
            };

        case ACTIONS.RESET:
            return initialState;

        case ACTIONS.LOAD_FROM_STORAGE:
            return action.payload;

        default:
            return state;
    }
}

// Provider
export function GameProvider({ children }) {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                dispatch({ type: ACTIONS.LOAD_FROM_STORAGE, payload: data });
            } catch (e) {
                console.error('Failed to load game from storage', e);
            }
        }
    }, []);

    // Persist to localStorage on every state change
    useEffect(() => {
        if (state.id) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
    }, [state]);

    // Dispatch wrapper to save to localStorage
    const wrappedDispatch = (action) => {
        dispatch(action);
    };

    return React.createElement(
        GameContext.Provider,
        { value: { state, dispatch: wrappedDispatch, ACTIONS } },
        children
    );
}

// Hook
export function useGame() {
    const ctx = useContext(GameContext);
    if (!ctx) {
        throw new Error('useGame must be used within GameProvider');
    }
    return ctx;
}

// Selectors (pure functions on state)
export const selectors = {
    alivePlayers: (state) => state.players.filter(p => p.is_alive),
    aliveNpcs: (state) => state.npcs.filter(n => n.is_alive),
    aliveKillers: (state) =>
        state.players.filter(p => p.is_alive && p.role === 'serial_killer'),
    currentRound: (state) =>
        state.rounds?.find(r => r.round_number === state.current_round),
    findPlayer: (state, id) =>
        state.players.find(p => p.id === id),
    findNpc: (state, id) =>
        state.npcs.find(n => n.id === id),
    votesForRound: (state, isRunoff = false) =>
        state.votes.filter(
            v => v.round_number === state.current_round && v.is_runoff === isRunoff
        ),
    nightActionsForRound: (state) =>
        state.night_actions.filter(na => na.round_number === state.current_round),
};

// Helper hook for advancing phase
export function useAdvance() {
    const { state, dispatch, ACTIONS } = useGame();
    const { advance } = require('./stateMachine');
    const { checkWinCondition } = require('./winCondition');
    const { getRouteForPhase } = require('./phaseRoutes');
    const { useNavigate } = require('react-router-dom');

    const navigate = useNavigate();

    return (phase, round) => {
        const updates = {};
        if (phase !== undefined) {
            updates.current_phase = phase;
        }
        if (round !== undefined) {
            updates.current_round = round;
        }

        dispatch({
            type: ACTIONS.SET_PHASE_AND_ROUND,
            payload: updates,
        });

        // Navigate to the new phase's route
        const newPhase = phase || state.current_phase;
        const route = getRouteForPhase(newPhase);
        navigate(route);
    };
}
