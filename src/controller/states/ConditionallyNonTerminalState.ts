import { GameAction } from "../../model/game/GameAction";
import { Maybe } from "../../model/utils/types";
import { EphemeralState } from "../abstract/EphemeralState";

export class ConditionallyNonTerminalState implements EphemeralState {
    private getNext: ()=>Maybe<GameAction>;
    constructor(nextAction: GameAction, condition:()=>boolean) {
        this.getNext = () => condition() ? nextAction : undefined;
    }
    get nextAction() {
        return this.getNext();
    }
}