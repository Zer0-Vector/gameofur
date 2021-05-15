import { GameAction } from "../GameAction";

export interface AGameAction {
    id: GameAction;
    run(): Promise<void>;
}