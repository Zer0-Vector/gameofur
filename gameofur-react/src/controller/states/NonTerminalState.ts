import { GameAction } from "../../model/game/GameAction";
import { EphemeralState } from "../abstract/EphemeralState";

export class NonTerminalState implements EphemeralState {
    nextAction: GameAction;
    constructor(nextAction:GameAction) {
        this.nextAction = nextAction;
    }
}