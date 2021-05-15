import { PieceId } from "../../model/game/ids/PieceId";
import { SpaceId } from "../../model/game/ids/SpaceId";
import { PlayerEntity } from "../../model/utils/types";
import { UrUtils } from "../../model/utils/UrUtils";
import { Renderable } from "../abstract/Renerable";
import { Piece } from "./Piece";

export class Pieces implements Renderable {
    readonly owner: PlayerEntity;
    readonly startPileId: SpaceId;
    readonly endPileId: SpaceId;
    pieces: Map<PieceId, Piece>;

    constructor(owner: PlayerEntity, startPileId: SpaceId, endPileId: SpaceId, pieces: Piece[]) {
        if (!UrUtils.isPlayer(owner)) {
            throw "Invalid player id: " + owner;
        }
        this.owner = owner;
        this.startPileId = startPileId;
        this.endPileId = endPileId;
        this.pieces = new Map(pieces.map(p => [p.id, p]));
    }

    render(): Promise<void[]> {
        console.debug("Loading player ", this.owner, " pieces to ", this.startPileId);
        return Promise.all(Array.from(this.pieces.values()).map(p => p.render()));
    }
}
