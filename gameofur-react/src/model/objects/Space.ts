import { Identifiable } from "../game/abstract/Identifiable";
import { EntityId } from "../game/ids/EntityId";
import { SpaceId } from "../game/ids/SpaceId";
import { Piece } from "./Piece";
import { PLAYER_MASK, PlayerEntity, SpaceEntity, SPACE_MASK } from "../utils/types";
import { UrUtils } from "../utils/UrUtils";

export class Space implements Identifiable<SpaceId> {
    id: SpaceId; // index into Board.spaces
    type: EntityId;
    distanceFromStart: number; // index into player track, Board.tracks[this.type & PLAYER_MASK]
    private _occupant?: Piece = undefined;
    constructor(n: number, type: EntityId, distanceFromStart: number) {
        this.id = SpaceId.get(type & (PLAYER_MASK + EntityId.MIDDLE), distanceFromStart);
        UrUtils.isValidSpace(type);
        this.type = type;
        this.distanceFromStart = distanceFromStart;
        console.debug("Created space: "+this.name);
    }
    get occupant() {
        return this._occupant;
    }
    set occupant(piece: Piece | undefined) {
        this._occupant = piece;
    }
    get name(): string {
        const player: PlayerEntity = this.type & PLAYER_MASK;
        const space: SpaceEntity = this.type & SPACE_MASK;
        const rosette: EntityId = this.type & EntityId.ROSETTE;
        let name = "";
        if (player > 0) {
            name += EntityId[player] + "-" + this.distanceFromStart + "-" + EntityId[space];
        } else if (UrUtils.hasEntityType(space, EntityId.MIDDLE)) {
            name += EntityId[space] + "-" + this.distanceFromStart;
        } else throw "This space is messed up...";
        
        if (rosette > 0) {
            name += "*"
        }

        return name;
    }
    isRosette() {
        return UrUtils.hasEntityType(this.type, EntityId.ROSETTE);
    }
    toString() {
        return this.id.toString();
    }
}