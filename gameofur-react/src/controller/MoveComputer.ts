import { Identifier } from "../model/game/abstract/Identifier";
import { Move } from "../model/game/abstract/Move";
import { Bucket } from "../model/objects/Bucket";
import { Piece } from "../model/objects/Piece";
import { Space } from "../model/objects/Space";
import { PlayerEntity, DiceValue } from "../model/utils/types";

export class MoveComputer {
    private readonly pieces: Piece[];
    private readonly track: Space[];
    private readonly player: PlayerEntity;
    constructor(whosTurn: PlayerEntity, pieces:Piece[], track:Space[]) {
        this.pieces = pieces;
        this.track = track;
        this.player = whosTurn;
    }

    compute(roll:DiceValue): Map<Identifier, Move> {
        if (roll === 0) {
            return new Map();
        }

        let legal: Map<Identifier, Move> = new Map();
        for (let p of this.pieces) {
            let index = p.location.distanceFromStart + roll;
            if (index >= this.track.length) {
                continue; // rolled too high to finish
            }
            let candidate = this.track[index];
            if (candidate instanceof Bucket) {
                console.assert(index === 15);
            } else if (candidate.occupant !== undefined) {
                if (candidate.occupant.owner === this.player) {
                    continue; // can't move atop a piece you own
                } else if (candidate.isRosette()) { // NOTE: for the standard board, we could just check that specific index.
                    continue; // can't knockout opponent on rosette
                }
            }
            // passed the test. This move is legal.
            console.debug("Found legal move: "+p.id+": "+p.location.name+" to "+candidate.name);
            legal.set(p.id, {
                piece: p,
                space: candidate,
                id: "move"+candidate.distanceFromStart,
            });
        }
        return legal;
    }
}