import type { GameModel } from "@/model";
import type { Maybe } from "@/types";
import { isFinishSpace, type PieceId, type PlayerId, type SpaceId } from "@/types/game";
import { RulesModel } from "./RulesModel";

export type Move = {
  player: PlayerId,
  piece: PieceId,
  to: SpaceId,
}

export type ValidationResult = {
  valid: false,
  error?: string
} | {
  valid: true,
  type: "move" | "knockout" | "finish",
}

export type GameState = {
  ended: false,
  currentPlayer: PlayerId,
  turn: number,
} | {
  ended: true,
  winner: PlayerId,
  turn: number,
};

export class RulesEngine {

  private readonly _model: GameModel;
  constructor(model: GameModel) {
    this._model = model;
  }

  getAllValidSpaces(player: PlayerId, diceTotal: number): Set<SpaceId> {
    const validSpaces: Set<SpaceId> = new Set();
    if (this._model.gameStatus === "ended") {
      return validSpaces;
    }

    this._model.getPiecesFor(player)
      .forEach(piece => {
        const validSpace = this.getValidSpaceFor(piece.id, diceTotal);
        if (validSpace) {
          validSpaces.add(validSpace);
        }
      });
    return validSpaces;
  }

  getValidSpaceFor(piece: PieceId, diceTotal: number): Maybe<SpaceId> {
    const pieceObj = this._model.getPiece(piece);
    if (!pieceObj) {
      throw new Error(`Piece not found: ${piece}`);
    }
    return this.getNextSpace(pieceObj.position, diceTotal, pieceObj.owner);
  }

  getNextSpace(start: SpaceId, steps: number, player: PlayerId): Maybe<SpaceId> {
    const startIndex = RulesModel.paths[player].indexOf(start);
    if (startIndex === -1) {
      throw new Error(`Invalid start space: ${start}`);
    }
    const path = RulesModel.paths[player];
    const nextIndex = startIndex + steps;
    if (nextIndex >= path.length) {
      return undefined;
    }
    return path[nextIndex];
  }

  validateMove(model: GameModel, move: Move): ValidationResult {
    // Get current game state
    this.checkGameState((model) => model.gameStatus === "in-progress");

    // Verify it's the player's turn
    if (model.currentPlayer !== move.player) {
      return { valid: false, error: `Not Player ${move.player}'s turn` };
    }

    // Get the piece
    const piece = model.getPiece(move.piece);
    if (!piece) {
      return { valid: false, error: "Piece not found" };
    }

    // Verify piece ownership
    if (piece.owner !== move.player) {
      return { valid: false, error: "Not your piece" };
    }

    // Get destination space
    const targetSpace = model.getSpace(move.to);
    if (!targetSpace) {
      return { valid: false, error: `Invalid destination: ${move.to}` };
    }

    // Check if move is along valid path
    const expectedSpace = this.getNextSpace(piece.position, model.diceTotal, move.player);
    if (expectedSpace !== move.to) {
      return { valid: false, error: `Invalid move along path: expected ${expectedSpace}, got ${move.to}` };
    }

    // Check if destination is occupied by own piece
    const pieceAtTarget = model.getPieceAt(move.to);
    if (pieceAtTarget && pieceAtTarget.owner === move.player) {
      return { valid: false, error: "Space occupied by your piece" };
    }

    // Check if move is along valid path for this player
    // This would need to verify the piece can legally move to the target space
    // based on the game's path rules and dice roll (not passed in current signature)

    // Determine move type
    if (isFinishSpace(move.to)) {
      return { valid: true, type: "finish" };
    }

    if (pieceAtTarget && pieceAtTarget.owner !== move.player) {
      return { valid: true, type: "knockout" };
    }

    return { valid: true, type: "move" };
  }

  checkGameState(expectation: (model: GameModel) => boolean): void {
    if (!expectation(this._model)) {
      throw new Error("Unexpected game state");
    }
  }

}