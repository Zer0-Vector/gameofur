import { Piece } from "../objects/Piece";
import { Space } from "../objects/Space";
import { EntityId } from "./ids/EntityId";
import { DiceValue, PlayerEntity } from "../utils/types";

export class TurnData {
    private static COUNTER = 1;
    rollValue: DiceValue | null = null;
    player: PlayerEntity;
    rosette: boolean = false;
    knockout: boolean = false;
    scored: boolean = false;
    piece?: Piece = undefined;
    startSpace?: Space = undefined;
    endSpace?: Space = undefined;
    number: number = TurnData.COUNTER++;
    knockedPiece?: Piece = undefined;
    noLegalMoves: boolean = false;

    protected constructor(player: PlayerEntity) {
        this.player = player;
    }

    static create(player:PlayerEntity = EntityId.PLAYER1): TurnData {
        return new TurnData(player);
    }
}