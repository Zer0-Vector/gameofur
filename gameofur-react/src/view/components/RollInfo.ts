import { Identifiable } from "../../model/game/abstract/Identifiable";
import { SimpleId } from "../../model/game/ids/SimpleId";
import { DiceValue } from "../../model/utils/types";
import { Updateable } from "../abstract/Updateable";


export class RollInfo implements Updateable<DiceValue>, Identifiable<SimpleId> {
    readonly id: SimpleId;
    constructor() {
        this.id = SimpleId.get("rollInfo");
    }
    async update(update: DiceValue): Promise<void> {
        $(this.id.selector).html("You rolled: <em class=\"rollValue\">"+update+"</em>");
    }
    async rolling(): Promise<void> {
        $(this.id.selector).html("Rolling...");
    };
}