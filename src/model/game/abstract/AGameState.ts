import { GameAction } from "../GameAction";
import { GameState } from "../GameState";
import { GameStateType } from "../GameStateType";
import { OuterTransitionMethod } from "../../utils/types";

export interface AGameState {
    id: GameState;
    type: GameStateType;
    peekNext: OuterTransitionMethod; // TODO convert this to enter state conditionals
    edges: GameAction[];
}
