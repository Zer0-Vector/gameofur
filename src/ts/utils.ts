"use strict";
export const enum EntityMask {
    PLAYER1 = 0x1,
    PLAYER2 = 0x2,
    ROSETTE = 0x4,
    ONRAMP = 0x8,
    OFFRAMP = 0x10,
    MIDDLE = 0x20
}

export type PlayerMask = EntityMask.PLAYER1 | EntityMask.PLAYER2;

export const enum TurnPhase {
    ROLL,MOVE,ACTION
}

export interface UrHandlers {
    roll(): void;
    passTurn(): void;
    pieceMoved(event: any, ui: any): void; // TODO types
    pieceDropped(event: any, ui: any): void; // TODO types
}

export namespace UrUtils {
    export const SPACE_ID_PREFIX: string = "s-";
    export const PIECE_ID_PREFIX: string = "pc-";

    export function isValidSpace(t: EntityMask) {
        const PLAYER_MASK: number = EntityMask.PLAYER1 + EntityMask.PLAYER2;
        const LOCATION_MASK: number = EntityMask.ONRAMP + EntityMask.OFFRAMP + EntityMask.MIDDLE;
        let player: number = t & PLAYER_MASK;
        let location: number = t & LOCATION_MASK;
        if (player > 2) {
            throw "Space cannot belong in both players' zones.";
        }
        switch(location) {
            case EntityMask.ONRAMP:
                if (player === 0) {
                    throw "ONRAMP must specify a player.";
                }
                break;
            case EntityMask.OFFRAMP:
                if (player === 0) {
                    throw "OFFRAMP must specify a player.";
                }
                break;
            case EntityMask.MIDDLE:
                if (player !== 0) {
                    throw "MIDDLE must not specify a player";
                }
                break; // valid
            default:
                throw "Space can only be one of ONRAMP, OFFRAMP or MIDDLE";
        }
    }

    export function isPlayer(t: EntityMask) {
        return t === EntityMask.PLAYER1 || t === EntityMask.PLAYER2;
    }
}

