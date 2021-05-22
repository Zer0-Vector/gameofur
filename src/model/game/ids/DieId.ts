import { Identifier } from "../abstract/Identifier";

export class DieId extends Identifier {
    public static get(n:number) {
        const id = "die"+n;
        return this.getOrCreate(id, () => new DieId(id));
    }

    public static from(id:string) {
        let matches = this.checkValid(/^die(\d+)$/, id);
        return this.get(parseInt(matches[1]));
    }
}