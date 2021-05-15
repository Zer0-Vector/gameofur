import { StateOwner } from "../model/game/abstract/StateOwner";
import { GameAction } from "../model/game/GameAction";
import { GameState } from "../model/game/GameState";
import { TRANSITIONS, ACTIONS, EPHEMERAL_STATES } from "./UrController";

export class GameEngine {
    private _model: StateOwner;
    constructor(model: StateOwner) {
        this._model = model;
        console.debug("GameEngine initialized. state="+GameState[this._model.state]);
    }

    private async loop(init:{count:number, next:GameAction}): Promise<number> {
        const next = await this.executeTransition(init.next);
        if (next === undefined) {
            return init.count;
        } else {
            return this.loop({count:init.count+1, next:next});
        }
    }

    private async executeTransition(action:GameAction): Promise<GameAction|undefined> {
        console.debug(GameState[this._model.state]+".doTransition: "+GameAction[action]);
        const dstState = TRANSITIONS[this._model.state][action];
        if (dstState === undefined) {
            return Promise.reject("Transition from "+GameState[this._model.state]+" via "+GameAction[action]+" is undefined.");
        }

        await ACTIONS[action].run();

        console.debug(GameState[this._model.state]+" --> "+GameState[dstState]);
        this._model.state = dstState;

        return EPHEMERAL_STATES[this._model.state]?.nextAction;
    }

    async do(currentAction: GameAction): Promise<void> {
        // TODO It'd be nice to know what action is pending.
        await this.loop({count:1, next:currentAction});
    }

}