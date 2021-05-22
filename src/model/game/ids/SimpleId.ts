import { Identifier } from "../abstract/Identifier";

export class SimpleId extends Identifier {
    public static get(id:string) {
        return this.getOrCreate(id, () => new SimpleId(id));
    }
}