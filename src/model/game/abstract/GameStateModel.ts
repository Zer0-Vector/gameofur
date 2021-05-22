import { GameAction } from "../GameAction";
import { GameState } from "../GameState";

export interface  GameStateModel<S extends GameState> {
    state: S;
    actions: GameAction[];
    next(action: GameAction): GameState;
}
