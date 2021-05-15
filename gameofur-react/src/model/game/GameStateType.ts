export enum GameStateType {
    TERMINAL, // in this state, we wait for a user interaction
    EPHEMERAL, // a "temporary" state which triggers its own transition (to chain actions together)
    CONDITIONAL // Same as EPHEMERAL, but checks a condition to determine the next action.
}