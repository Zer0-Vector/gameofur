export interface TurnController {
    nextTurn(): void;
    readonly currentTurn?: number;
}
