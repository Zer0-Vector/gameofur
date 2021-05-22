import { EntityId } from "../game/ids/EntityId";
import { Piece } from "./Piece";
import { Space } from "./Space";

export class Bucket extends Space {
    occupants: Set<Piece> = new Set<Piece>();
    constructor(id: number, type: EntityId, trackId: number) {
        super(id, (() => {
            let m = type & (EntityId.START + EntityId.FINISH)
            if (m === EntityId.START || m === EntityId.FINISH) {
                return type;
            }
            throw "Invalid space type for bucket: "+type+"("+m+"), id="+id+", trackId="+trackId;
        })(), trackId);
    }
    get occupant() {
        throw "Bucket has multiple occupants. Use occupants instead.";
    }
    set occupant(p: Piece | undefined) {
        throw "Bucket has multiple occupants. Use occupants instead."
    }
}