import { AName } from "./AName";
import { Selectable } from "./Selectable";

export abstract class Identifier extends AName implements Selectable {
    protected static REPO = new Map<string, Identifier>();

    protected constructor(id:string) {
        super(id);
        if (!Identifier.REPO.has(id)) {
            Identifier.REPO.set(id, this);
        }
    }
    get selector(): string {
        return "#"+this.toString();
    }

    equals(obj:Identifier): boolean {
        if (obj instanceof Identifier) {
            return this.toString() === obj.toString();
        }
        return false;
    }

    protected static checkValid(regex:RegExp, input:string) {
        let rval = regex.exec(input);
        if (rval === null) {
            throw "'"+input+"' is not a valid "+typeof this;
        }
        return rval;
    }

    protected static getOrCreate<T extends Identifier>(id:string, create:()=>T): T {
        return this.REPO.get(id) as T || create();
    }
}