import { Board } from "../objects/Board";
import { Bucket } from "../objects/Bucket";
import { Dice } from "../objects/Dice";
import { Player } from "../objects/Player";
import { PlayerInfoMap } from "../utils/types";
import { UrUtils } from "../utils/UrUtils";
import { StateOwner } from "./abstract/StateOwner";
import { GameState } from "./GameState";
import { EntityId } from "./ids/EntityId";
import { TurnData } from "./TurnData";

export class UrModel implements StateOwner {
    public readonly board: Board;
    public readonly players: PlayerInfoMap<Player>; 
    public readonly dice: Dice = new Dice();
    public turn = TurnData.create();
    public nextTurn = TurnData.create(EntityId.PLAYER2);
    public state: GameState = GameState.Initial;
    public score: PlayerInfoMap<number>;
    
    // public readonly history: TurnTaken[] = []; // TODO
    
    private constructor(player1: Player, player2: Player) {
        this.players = {
            [EntityId.PLAYER1]: player1,
            [EntityId.PLAYER2]: player2
        };
        this.board = new Board();
        this.score = {[EntityId.PLAYER1]: 0, [EntityId.PLAYER2]: 0};
    }

    get currentPlayer() {
        return this.players[this.turn.player];
    }

    get currentOpponent() {
        return this.players[UrUtils.getOpponent(this.turn.player)];
    }

    get currentTrack() {
        return this.board.tracks[this.turn.player];
    }

    get opponentStartBucket() {
        return this.board.tracks[UrUtils.getOpponent(this.turn.player)][0] as Bucket;
    }

    static create(player1: Player, player2: Player) {
        return new UrModel(player1, player2);
    }
}