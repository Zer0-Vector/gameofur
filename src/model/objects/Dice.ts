import { DiceList, DiceValue, DieValue } from "../utils/types";

export class Dice {
    values: DiceList;
    rolled: boolean = false;

    constructor() {
        this.values = this.diceRoll();
    }

    get total(): DiceValue {
        if (this.values === null) {
            throw "Dice not initialized";
        }
        return (this.values[0] + this.values[1] + this.values[2] + this.values[3]) as DiceValue;
    }

    private dieRoll(): DieValue {
        return Math.floor(Math.random() * 2) as DieValue;
    }

    private diceRoll(): DiceList {
        try {
            return [ this.dieRoll(), this.dieRoll(), this.dieRoll(), this.dieRoll() ];
        } finally {
            this.rolled = true;
        }
    }

    roll() {
        this.values = this.diceRoll();
        return this.total;
    }
}