import { TurnController } from '../view/abstract/TurnController'



export class GameOfUrController {
    private _turnController?: TurnController = undefined;

    constructor() {
        this.registerTurnController = this.registerTurnController.bind(this);
    }

    public registerTurnController(turnCtrl:TurnController) {
        this._turnController = turnCtrl;
    }
}