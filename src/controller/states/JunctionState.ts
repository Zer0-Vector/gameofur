import { GameAction } from "../../model/game/GameAction";
import { EphemeralState } from "../abstract/EphemeralState";

export class JunctionState implements EphemeralState {
    private computeNext: ()=>GameAction;
    constructor(computeNext:()=>GameAction) {
        this.computeNext = computeNext;
    }
    get nextAction() {
        return this.computeNext();
    }
}