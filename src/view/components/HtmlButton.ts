import { Identifiable } from "../../model/game/abstract/Identifiable.js";
import { Enableable } from "../abstract/Enableable.js";
import JQuerySelectable from "../JQuerySelectable.js";
import { Selectable as ISelectable } from "../../model/game/abstract/Selectable"
import { SimpleId as SimpleIdentifier } from "../../model/game/ids/SimpleId"

export class HtmlButton extends JQuerySelectable.Selectable implements Enableable, Identifiable<SimpleIdentifier>, ISelectable {
    id: SimpleIdentifier;
    constructor(id: string) {
        super(id);
        this.id = SimpleIdentifier.get(id);
    }
    get selector() {
        return "button" + this.id.selector;
    }
    enable(): void {
        console.debug("Enabling " + this.id);
        this.jquery.prop("disabled", false);
    }
    disable(): void {
        console.debug("Disabling " + this.id);
        this.jquery.prop("disabled", true);
    }
}
