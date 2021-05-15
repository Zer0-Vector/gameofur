import { Identifiable } from "../../model/game/abstract/Identifiable";
import { DiceList } from "../../model/utils/types";
import { Updateable } from "../abstract/Updateable";
import { SimpleId } from "../../model/game/ids/SimpleId"
import { Die } from "./Die";

export class Dice implements Updateable<DiceList>, Identifiable<SimpleId>{
    readonly id: SimpleId;
    readonly dice: [Die, Die, Die, Die];
    constructor() {
        this.id = SimpleId.get("diceCup");
        this.dice = [
            Die.getNew(0),
            Die.getNew(1),
            Die.getNew(2),
            Die.getNew(3)
        ];
    }
    
    async update(values: DiceList): Promise<void> {
        this.clear();
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => resolve(), 250);
        }).then(async () => { await Promise.all(values.map((val, i) => this.dice[i].update(val))); } );
    }

    clear() {
        this.dice.forEach(d => {
            d.clear();
        });
    }
}