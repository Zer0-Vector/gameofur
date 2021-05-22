import { Identifier } from "../abstract/Identifier";
import { PlayerEntity } from "../../utils/types";
import { UrUtils } from "../../utils/UrUtils";


export class PieceId extends Identifier {
    readonly owner:PlayerEntity;
    private constructor(id:string, owner:PlayerEntity) {
        super(id);
        this.owner = owner
    }
    public static get(owner:PlayerEntity, n:number) {
        const id = "pc"+UrUtils.toIdentifierPart(owner)+n;
        return this.getOrCreate(id, () => new PieceId(id, owner));
    }

    public static from(id:string) {
        const matches = this.checkValid(/^pc([AB])(\d+)$/, id);
        return this.get(UrUtils.toEntityId(matches[1]) as PlayerEntity, parseInt(matches[2]));
    }
}