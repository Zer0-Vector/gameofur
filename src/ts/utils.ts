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

export type PlayerEntity = EntityId.PLAYER1 | EntityId.PLAYER2;
export type OnboardSpaceEntity = EntityId.ONRAMP | EntityId.OFFRAMP | EntityId.MIDDLE;
export type BucketEntity = EntityId.START | EntityId.FINISH;
export type SpaceEntity = BucketEntity | OnboardSpaceEntity;

export const PLAYER_MASK = EntityId.PLAYER1 + EntityId.PLAYER2;
export const BUCKET_MASK = EntityId.START + EntityId.FINISH;
export const ONBOARD_MASK = EntityId.ONRAMP + EntityId.OFFRAMP + EntityId.MIDDLE;
export const SPACE_MASK = ONBOARD_MASK + BUCKET_MASK;

export enum GameState {
    Initial,
    PreGame,
    TurnStart,
    Rolled,
    Moved,
    EndTurn,
    GameOver,
    PreMove,
    PostMove,
    CheckScore,
    PlayersReady,
    PreRoll,
    PostGame
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
    AnalyzeMove,
    RosetteBonus,
    KnockoutOpponent,
    PieceScored,
    PassTurn,
    EndGame,
    NewGame,
    MovePiece,
    AllFinished,
    SetupGame,
    TurnEnding,
    MoveFinished,
    ShowWinner
}

export interface UrHandlers {
    roll(): void;
    passTurn(): void;
    pieceDropped(event: any, ui: any): void; // TODO types
    startGame(): void;
}

export namespace UrUtils {
    export const SPACE_ID_PREFIX: string = "s-";
    export const PIECE_ID_PREFIX: string = "pc-";

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
}

