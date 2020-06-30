"use strict";

export enum EntityId {
    PLAYER1 = 0x1,
    PLAYER2 = 0x2,
    ROSETTE = 0x4,
    ONRAMP = 0x8,
    OFFRAMP = 0x10,
    MIDDLE = 0x20,
    START = 0x40,
    FINISH = 0x80
}

export type Maybe<T> = T | undefined;
export type Nullable<T> = T | null;

export type PlayerEntity = EntityId.PLAYER1 | EntityId.PLAYER2;
export type OnboardSpaceEntity = EntityId.ONRAMP | EntityId.OFFRAMP | EntityId.MIDDLE;
export type BucketEntity = EntityId.START | EntityId.FINISH;
export type SpaceEntity = BucketEntity | OnboardSpaceEntity;

export const PLAYER_MASK = EntityId.PLAYER1 + EntityId.PLAYER2;
export const BUCKET_MASK = EntityId.START + EntityId.FINISH;
export const ONBOARD_MASK = EntityId.ONRAMP + EntityId.OFFRAMP + EntityId.MIDDLE;
export const SPACE_MASK = ONBOARD_MASK + BUCKET_MASK;

export abstract class Identifier {
    protected constructor(type:string, subtype:Maybe<string>, number: Maybe<number>) {
        const id = type + (subtype === undefined ? "" : subtype.toUpperCase()) + (number === undefined ? "" : number);
        this.toString = () => id;
    }
    get selector(): string {
        return "#"+this.toString();
    }
    equals(obj:any): boolean {
        if (obj instanceof Identifier) {
            return this.toString() === (obj as Identifier).toString();
        }
        return false;
    }
}

export class DieId extends Identifier {
    constructor(n:number) {
        super("die", undefined, n);
    }
}

export class SimpleId extends Identifier {
    constructor(id:string) {
        super(id, undefined, undefined);
    }
}

export class PieceId extends Identifier {
    constructor(owner:PlayerEntity, n:number) {
        super("pc", UrUtils.StringId[owner], n)
    }
}

export class SpaceId extends Identifier {
    constructor(column:PlayerEntity|EntityId.MIDDLE, n:number) {
        super("s", UrUtils.StringId[column], n);
    }
}

export interface Identifiable<T extends Identifier> {
    readonly id: T;
}

export enum GameState {
    Initial,
    PreGame,
    TurnStart,
    Rolled,
    Moved,
    EndTurn,
    GameOver,
    PreMove,
    CheckScore,
    PlayersReady,
    PreRoll,
    PostGame,
    PostMove,
    PieceDropped,
    ReadyToMove
}

export enum GameAction {
    /**
     * Triggers on document.ready().
     *  - Enable Pregame UI: set name, start game button
     */
    Initialize,

    /**
     * Triggers on button#startGame.click()
     *  - Show scores
     *  - Setup game model: turn=player 1
     */
    StartGame,

    /**
     * - Update turn indicator
     * - Enable dice button
     */
    StartingTurn,

    /**
     * Triggers on button#RollDice.click()
     * - Simulate dice roll
     * - Update model/view based on die roll
     */
    ThrowDice,

    /**
     * Triggers on PREMOVE.enter
     * -
     */
    EnableLegalMoves,
    RosetteBonus,
    KnockoutOpponent,
    PieceScored,
    PassTurn,
    NewGame,
    MovePiece,
    AllFinished,
    SetupGame,
    TurnEnding,
    MoveFinished,
    ShowWinner,
    FreezeBoard,
    MovesAvailable
}

export interface UrHandlers {
    newGame(): void;
    roll(): void;
    passTurn(): void;
    pieceDropped(event: JQueryEventObject, ui: JQueryUI.DroppableEventUIParam): void; // TODO types
    startGame(): void;
    pieceMoved(pid:string, sid:string): void;
}

export type DieValue =  0 | 1;
export type DiceValue = 0 | 1 | 2 | 3 | 4;
export type DiceList = [DieValue, DieValue, DieValue, DieValue];

export namespace UrUtils {
    export const SPACE_ID_PREFIX: string = "s-";
    export const PIECE_ID_PREFIX: string = "pc-";

    export function getPieceId(player: PlayerEntity, n:number) {
        return PIECE_ID_PREFIX + StringId[player] + n;
    }

    export function getSpaceId(space: SpaceEntity, n:number) {
        isValidSpace(space);
        let mask = PLAYER_MASK + EntityId.MIDDLE;
        let index: (PlayerEntity | EntityId.MIDDLE) = space & mask;
        return SPACE_ID_PREFIX + StringId[index] + n;
    }

    export const StringId = {
        [EntityId.PLAYER1]: "a",
        [EntityId.PLAYER2]: "b",
        [EntityId.MIDDLE]: "m",
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

