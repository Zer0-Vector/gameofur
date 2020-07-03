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
export type SpaceColumn = PlayerEntity | EntityId.MIDDLE;

export const PLAYER_MASK = EntityId.PLAYER1 + EntityId.PLAYER2;
export const BUCKET_MASK = EntityId.START + EntityId.FINISH;
export const ONBOARD_MASK = EntityId.ONRAMP + EntityId.OFFRAMP + EntityId.MIDDLE;
export const SPACE_MASK = ONBOARD_MASK + BUCKET_MASK;

export abstract class AName {
    protected constructor(name:string) {
        this.toString = () => name;
    }
}

export interface Selectable {
    readonly selector: string;
}

export abstract class Identifier extends AName implements Selectable {
    protected static REPO = new Map<string, Identifier>();

    protected constructor(id:string) {
        super(id);
        if (!Identifier.REPO.has(id)) {
            Identifier.REPO.set(id, this);
        }
    }
    get selector(): string {
        return "#"+this.toString();
    }

    equals(obj:Identifier): boolean {
        if (obj instanceof Identifier) {
            return this.toString() === obj.toString();
        }
        return false;
    }

    protected static checkValid(regex:RegExp, input:string) {
        let rval = regex.exec(input);
        if (rval === null) {
            throw "'"+input+"' is not a valid "+typeof this;
        }
        return rval;
    }

    protected static getOrCreate<T extends Identifier>(id:string, create:()=>T): T {
        return this.REPO.get(id) as T || create();
    }
}

export class DieId extends Identifier {
    public static get(n:number) {
        const id = "die"+n;
        return this.getOrCreate(id, () => new DieId(id));
    }

    public static from(id:string) {
        let matches = this.checkValid(/^die(\d+)$/, id);
        return this.get(parseInt(matches[1]));
    }
}

export class SimpleId extends Identifier {
    public static get(id:string) {
        return this.getOrCreate(id, () => new SimpleId(id));
    }
}

export class PieceId extends Identifier {
    readonly owner:PlayerEntity;
    private constructor(id:string, owner:PlayerEntity) {
        super(id);
        this.owner = owner
    }
    public static get(owner:PlayerEntity, n:number) {
        const id = "pc"+UrUtils.toIdentifierPart(owner)+n;
        return this.getOrCreate(id, () => new PieceId(id, owner));
    }

    public static from(id:string) {
        const matches = this.checkValid(/^pc([AB])(\d+)$/, id);
        return this.get(UrUtils.toEntityId(matches[1]) as PlayerEntity, parseInt(matches[2]));
    }
}

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

export interface Identifiable<ID extends Identifier> {
    readonly id: ID;
}

export interface Container<ContainableType extends Identifier> {
    occupants: ContainableType[];
}

export interface Containable<ContainerType extends Identifier> {
    location: ContainerType;
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
    startGame(): void;
    pieceMoved(piece:Identifier, space:Identifier): void;
}

export type DieValue =  0 | 1;
export type DiceValue = 0 | 1 | 2 | 3 | 4;
export type DiceList = [DieValue, DieValue, DieValue, DieValue];

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
class BoardSkeleton {
    readonly track = {
        [EntityId.PLAYER1]: new Array<SpaceId>(16),
        [EntityId.PLAYER2]: new Array<SpaceId>(16),
    }
    constructor() {
        let i = 0;
        for (; i < 5; i++) {
            this.track[EntityId.PLAYER1][i] = SpaceId.get(EntityId.PLAYER1, i);
            this.track[EntityId.PLAYER2][i] = SpaceId.get(EntityId.PLAYER2, i);
        }
        for (; i < 13; i++) {
            this.track[EntityId.PLAYER1][i] = SpaceId.get(EntityId.MIDDLE, i);
            this.track[EntityId.PLAYER2][i] = SpaceId.get(EntityId.MIDDLE, i);
        }
        for (; i < 16; i++) {
            this.track[EntityId.PLAYER1][i] = SpaceId.get(EntityId.PLAYER1, i);
            this.track[EntityId.PLAYER2][i] = SpaceId.get(EntityId.PLAYER2, i);
        }
    }
}
export const BOARD = new BoardSkeleton();

