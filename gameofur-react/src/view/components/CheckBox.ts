import { Identifiable } from "../../model/game/abstract/Identifiable.js";
import JQuerySelectable from "../JQuerySelectable.js";
import { SimpleId as SimpleIdentifier } from "../../model/game/ids/SimpleId"

export class CheckBox extends JQuerySelectable.Selectable implements Identifiable<SimpleIdentifier> {
    id: SimpleIdentifier;
    selector: string;
    constructor(id: string) {
        super(id);
        this.id = SimpleIdentifier.get(id);
        this.selector = "#" + this.id;
    }
    click() {
        this.jquery.trigger("click");
    }
}
