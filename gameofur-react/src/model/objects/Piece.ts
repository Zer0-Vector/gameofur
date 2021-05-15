import { Identifiable } from "../game/abstract/Identifiable";
import { EntityId } from "../game/ids/EntityId";
import { PieceId } from "../game/ids/PieceId";
import { PlayerEntity } from "../utils/types";
import { Space } from "./Space";
import { UrUtils } from "../utils/UrUtils";


export class Piece implements Identifiable<PieceId> {
    id: PieceId;
    owner: PlayerEntity;
    private _locationId: string; // TODO remove reference to space; use space repository to hold spaces; make as few links between objects as possible
    private _location?: Space; // optional to handle initialization chicken/egg problem
    constructor(owner: PlayerEntity, n:number) {
        if (!UrUtils.isPlayer(owner)) {
            throw "Invalid player id: "+owner;
        }
        this.owner = owner;
        this.id = PieceId.get(owner, n);
        this._locationId = UrUtils.getSpaceId(owner | EntityId.START, 0);
    }
    get location() {
        if (this._location === undefined) {
            throw "Something went wrong. location===undefined";
        }
        return this._location;
    }
    set location(location: Space) {
        this._location = location;
    }
}