import { DieId } from "../../model/game/ids/DieId";
import { DieValue } from "../../model/utils/types";
import { Renderable } from "../abstract/Renerable";
import { Updateable } from "../abstract/Updateable";
import JQuerySelectable from "../JQuerySelectable";
import { Selectors } from "../utils/Selectors"

export class Die extends JQuerySelectable.Id<DieId> implements Updateable<DieValue>, Renderable {
    static nextId = 0;

    static readonly svgMap = {
        [0 as DieValue]: 'images/die0.svg',
        [1 as DieValue]: 'images/die1.svg'
    }

    static getNew(n:number):Die {
        if (n > 3 || n < 0) throw "Invlid Die id number: "+n;
        return new Die(DieId.get(n));
    }

    id: DieId;    
    currentView: DieValue = 0;
    
    private constructor(id:DieId) {
        super(id.toString());
        this.id = id;
    }

    get svg(): string {
        return Die.svgMap[this.currentView];
    }

    render(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Selectors.DieRotationClasses.removeFrom(this);
            this.jquery.load(this.svg, (response, status, xhr) => {
                if (status === "success") {                    
                    console.debug("Loaded view",this.currentView,"into",this.selector);
                    resolve();
                } else {
                    let reason = "Error loading "+this.svg+" into "+this.selector;
                    console.error(reason);
                    reject(reason);
                }
            });
        });
    }
    
    async update(view: DieValue): Promise<void> {
        let orientation = Math.floor(Math.random() * 3); // TODO
        this.currentView = view;
        if (orientation < 2) { // 2 === no rotation
            await this.render();
            Selectors.DieRotationClasses.getClass(orientation).addTo(this);
        } else {
            return this.render();
        }
    }

    clear() {
        $(this.id.selector).empty();
    }
}