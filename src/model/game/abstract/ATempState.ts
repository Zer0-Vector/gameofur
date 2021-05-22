import { GameAction } from "../GameAction";
import { AGameState } from "./AGameState";

export interface ATempState extends AGameState {
    action: GameAction;
}
