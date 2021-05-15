import { Identifier } from "../abstract/Identifier";
import { SpaceColumn } from "../../utils/types";
import { UrUtils } from "../../utils/UrUtils";
import { EntityId } from "./EntityId";


export class SpaceId extends Identifier {
    readonly trackId: number;

    private constructor(id:string, trackId:number) {
        super(id);
        this.trackId = trackId;
    }
    public static get(column:SpaceColumn, n:number) {
        const id = "s" + UrUtils.toIdentifierPart(column) + n;
        return this.getOrCreate(id, () => new SpaceId(id, n));
    }

    public static from(id: string) {
        const matches = this.checkValid(/^s([ABM])(\d+)$/, id);
        const column = (() => {
            switch(matches[1]) {
                case 'A': return EntityId.PLAYER1;
                case 'B': return EntityId.PLAYER2;
                case 'M': return EntityId.MIDDLE;
                default: throw "'"+id+"' is not a SpaceId";
            }
        })();
        return this.get(column, parseInt(matches[2]))
    }
}