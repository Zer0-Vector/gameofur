import { Selectable } from "../game/abstract/Selectable";
import { EntityId } from "../game/ids/EntityId";
import { PlayerEntity, SpaceEntity, PLAYER_MASK, SpaceColumn } from "./types";

export namespace UrUtils {
    export const SPACE_ID_PREFIX: string = "s-";
    export const PIECE_ID_PREFIX: string = "pc-";

    export function getPieceId(player: PlayerEntity, n:number) {
        return PIECE_ID_PREFIX + toIdentifierPart(player) + n;
    }

    export function asSelectable(s:string): Selectable {
        return new (class implements Selectable {
            selector: string = s;
        })();
    }

    export function getSpaceId(space: SpaceEntity, n:number) {
        isValidSpace(space);
        let mask = PLAYER_MASK + EntityId.MIDDLE;
        let index: SpaceColumn = space & mask;
        return SPACE_ID_PREFIX + toIdentifierPart(index) + n;
    }

    export function toIdentifierPart(entityId:SpaceColumn) {
        switch(entityId) {
            case EntityId.PLAYER1: return 'A';
            case EntityId.PLAYER2: return 'B';
            case EntityId.MIDDLE: return 'M';
            default: return undefined;
        }
    }
    export function toEntityId(idPart:string) {
        switch(idPart) {
            case 'A': return EntityId.PLAYER1;
            case 'B': return EntityId.PLAYER2;
            case 'M': return EntityId.MIDDLE;
            default: return undefined;
        }
    }

    export function isValidSpace(t: EntityId) {
        const PLAYER_MASK: number = EntityId.PLAYER1 + EntityId.PLAYER2;
        const LOCATION_MASK: number = EntityId.ONRAMP + EntityId.OFFRAMP + EntityId.MIDDLE + EntityId.START + EntityId.FINISH;
        let player: number = t & PLAYER_MASK;
        let location: number = t & LOCATION_MASK;
        if (player > 2) {
            throw "Space cannot belong in both players' zones.";
        }
        switch(location) {
            case EntityId.START:
                // fallthrough
            case EntityId.FINISH:
                if ((t & EntityId.ROSETTE) === EntityId.ROSETTE) {
                    throw location+" cannot have a rosette."
                }
                // fall through, next check also applies to start/finish
            case EntityId.ONRAMP:
            case EntityId.OFFRAMP:
                if (player === 0) {
                    throw location+" must specify a player.";
                }
                break; // valid
            case EntityId.MIDDLE:
                if (player !== 0) {
                    throw "MIDDLE must not specify a player.";
                }
                break;
            default:
                throw "Space can only be one of ONRAMP, OFFRAMP, MIDDLE, START, FINISH: "+location;
        }
    }

    export function isPlayer(t: EntityId) {
        return t === EntityId.PLAYER1 || t === EntityId.PLAYER2;
    }

    export function hasEntityType(compoundType:EntityId, type:EntityId) {
        return (compoundType & type) === type;
    }

    export function entityHasAny(compoundType:EntityId, type1:EntityId, type2:EntityId, ...others:EntityId[]) {
        let mask = type1 + type2;
        for (let o of others) {
            mask += o;
        }
        return (compoundType & mask) > 0;
    }

    export function getOpponent(player:EntityId):PlayerEntity {
        return (player ^ PLAYER_MASK) & PLAYER_MASK;
    }
}