import { PlayerEntity } from "../utils/types";
import { UrUtils } from "../utils/UrUtils";
import { Piece } from "./Piece";

export class Player {
    name: string;
    mask: PlayerEntity;
    private _pieces: Piece[]; // TODO make pieces addressable by id
    constructor(name: string, mask: PlayerEntity) {
        this.name = name;
        if (!UrUtils.isPlayer(mask)) {
            throw "Invalid player mask: "+mask;
        }
        this.mask = mask;
        this._pieces = this.buildPieces();
    }

    private buildPieces(): Piece[] {
        let pcs: Piece[] = [];
        for (let i = 0; i < 7; i++) {
            pcs.push(new Piece(this.mask, i));
        }
        return pcs;
    }
    get pieces(): Piece[] {
        return this._pieces;
    }
}