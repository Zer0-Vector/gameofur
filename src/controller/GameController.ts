import type { Identifiable } from "@/interfaces";
import type { GameModel } from "@/model";
import { Piece, Space, Die } from "@/objects";
import type { EmptyObject } from "@/types";
import type { PieceId, SpaceId, SpaceNotation } from "@/types/game";

type GameActionsMap = {
  "piece.select": Identifiable<PieceId>,
  "piece.move": Identifiable<PieceId> & { to: SpaceId },
  "dice.roll": EmptyObject,
  "space.select": Identifiable<SpaceId>,
  "deselectAll": EmptyObject,
  "game.start": EmptyObject,
  "game.reset": EmptyObject,
}

/**
 * Game action types that can be triggered by user interaction.
 */
export type GameAction = {
  [K in keyof GameActionsMap]: GameActionsMap[K] & { type: K }
}[keyof GameActionsMap];

/**
 * Result of a game action.
 */
export interface ActionResult {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * GameController - Only updates the model based on game rules.
 * Does NOT handle graphics or rendering.
 * Follows MVC pattern: Controller updates Model, View observes Model.
 */
export class GameController {
  private readonly model: GameModel;

  constructor(model: GameModel) {
    this.model = model;
  }

  /**
   * Initialize the game with pieces, spaces, and dice.
   */
  initialize(): void {
    this.createSpaces();
    this.createPieces();
    this.createDice();
  }

  /**
   * Handle a game action.
   * This is the single entry point for all user interactions.
   */
  async handleAction(action: GameAction): Promise<ActionResult> {
    switch (action.type) {
      case "piece.select":
        return this.selectPiece(action.id);

      case "piece.move":
        return this.movePiece(action.id, action.to);

      case "dice.roll":
        return this.rollDice();

      case "space.select":
        return this.selectSpace(action.id);

      case "deselectAll":
        return this.deselectAll();

      case "game.start":
        return this.startGame();

      case "game.reset":
        return this.resetGame();

      default:
        return { success: false, message: "Unknown action" };
    }
  }

  /**
   * Update method called each frame (for any time-based logic).
   */
  update(_deltaTime: number): void {
    // Update game objects
    this.model.pieces.forEach((piece) => piece.update(_deltaTime));
    this.model.spaces.forEach((space) => space.update(_deltaTime));
    this.model.dice.forEach((die) => die.update(_deltaTime));
  }

  // Private methods - implement game logic

  private selectPiece(pieceId: string): ActionResult {
    const piece = this.model.getPiece(pieceId);

    if (!piece) {
      return { success: false, message: "Piece not found" };
    }

    // Check if it's the correct player's piece
    if (piece.player !== this.model.currentPlayer) {
      return { success: false, message: "Not your piece" };
    }

    // Deselect previous piece if any
    if (this.model.selectedPieceId) {
      const prevPiece = this.model.getPiece(this.model.selectedPieceId);
      if (prevPiece) {
        prevPiece.deselect();
        this.model.deselectPiece(this.model.selectedPieceId);
      }
    }

    // Select the new piece
    piece.select();
    this.model.selectPiece(pieceId);

    return { success: true, message: `Selected piece ${pieceId}` };
  }

  private async movePiece(pieceId: string, spaceId: string): Promise<ActionResult> {
    const piece = this.model.pieces.get(pieceId);
    const space = this.model.spaces.get(spaceId);

    if (!piece || !space) {
      return { success: false, message: "Piece or space not found" };
    }

    if (!space.canOccupy(piece)) {
      return { success: false, message: "Cannot occupy this space" };
    }

    const oldPosition = piece.position;

    // Remove piece from old space
    if (piece.position) {
      const oldSpace = Array.from(this.model.spaces.values()).find(
        (s) => s.notation === piece.position
      );
      if (oldSpace) {
        oldSpace.removePiece();
        this.model.vacateSpace(oldSpace.id);
      }
    }

    // Handle knockout
    const occupant = space.removePiece();
    if (occupant) {
      occupant.returnToStart();
      this.model.knockOutPiece(occupant.id);
    }

    // Move piece to new space
    space.placePiece(piece);
    this.model.occupySpace(spaceId, pieceId);
    this.model.movePiece(pieceId, oldPosition, space.notation);

    // Check for rosette (extra turn)
    if (space.isRosette) {
      return {
        success: true,
        message: "Moved to rosette! Roll again!",
        data: { extraTurn: true },
      };
    }

    // Switch player
    const nextPlayer = this.model.currentPlayer === "A" ? "B" : "A";
    this.model.setCurrentPlayer(nextPlayer);

    return { success: true, message: "Piece moved" };
  }

  private async rollDice(): Promise<ActionResult> {
    const rollPromises = this.model.dice.map((die) => die.roll());

    const results = await Promise.all(rollPromises);
    const total = results.reduce((sum: number, val) => sum + val, 0);

    // Notify model of dice roll
    this.model.rollDice(results, total);

    // Highlight valid moves based on roll
    this.highlightValidMoves(total);

    return {
      success: true,
      message: `Rolled ${total}`,
      data: { roll: total },
    };
  }

  private async selectSpace(spaceId: string): Promise<ActionResult> {
    const space = this.model.getSpace(spaceId);

    if (!space) {
      return { success: false, message: "Space not found" };
    }

    if (!this.model.selectedPieceId) {
      return { success: false, message: "No piece selected" };
    }

    // Move the selected piece to this space
    return this.movePiece(this.model.selectedPieceId, spaceId);
  }

  private deselectAll(): ActionResult {
    if (this.model.selectedPieceId) {
      const piece = this.model.getPiece(this.model.selectedPieceId);
      if (piece) {
        piece.deselect();
        this.model.deselectPiece(this.model.selectedPieceId);
      }
    }

    // Unhighlight all spaces
    this.model.spaces.forEach((space, id) => {
      if (space.state.active) {
        space.setActive(false);
        this.model.unhighlightSpace(id);
      }
    });

    return { success: true, message: "Deselected all" };
  }

  private startGame(): ActionResult {
    this.model.startGame();
    return { success: true, message: "Game started" };
  }

  private resetGame(): ActionResult {
    // Reset all pieces
    this.model.pieces.forEach((piece) => {
      piece.reset();
    });

    // Reset all spaces
    this.model.spaces.forEach((space) => {
      space.reset();
    });

    // Reset dice
    this.model.dice.forEach((die) => {
      die.reset();
    });

    this.model.resetGame();

    return { success: true, message: "Game reset" };
  }

  private highlightValidMoves(_roll: number): void {
    // TODO: Implement proper path logic based on NOTATION.md
    // For now, just highlight some spaces as a placeholder

    this.model.spaces.forEach((space, id) => {
      // Simple logic: highlight spaces if they can be occupied
      if (this.model.selectedPieceId) {
        const piece = this.model.getPiece(this.model.selectedPieceId);
        if (piece && space.canOccupy(piece)) {
          space.setActive(true);
          this.model.highlightSpace(id);
        }
      }
    });
  }

  private createSpaces(): void {
    // Create spaces based on NOTATION.md
    // Player A path: a4 a3 a2 a1 m1 m2 m3 m4 m5 m6 m7 m8 a8 a7 F
    // Player B path: b4 b3 b2 b1 m1 m2 m3 m4 m5 m6 m7 m8 b8 b7 F
    // Rosettes at: a1, b1, m4, a7, b7

    const rosettes = new Set<SpaceNotation>([ "A1", "B1", "M4", "A7", "B7"]);
    const allSpaces: SpaceNotation[] = [
      "A1",
      "A2",
      "A3",
      "A4",
      "A7",
      "A8",
      "B1",
      "B2",
      "B3",
      "B4",
      "B7",
      "B8",
      "M1",
      "M2",
      "M3",
      "M4",
      "M5",
      "M6",
      "M7",
      "M8",
    ];

    allSpaces.forEach((notation) => {
      const isRosette = rosettes.has(notation);
      const space = new Space(notation, isRosette);
      this.model.addSpace(space);
    });
  }

  private createPieces(): void {
    // Create 7 pieces for each player
    for (let i = 0; i < 7; i++) {
      // Player A pieces
      const pieceA = new Piece(i, "A");
      this.model.addPiece(pieceA);

      // Player B pieces
      const pieceB = new Piece(i, "B");
      this.model.addPiece(pieceB);
    }
  }

  private createDice(): void {
    // Create 4 dice
    for (let i = 0; i < 4; i++) {
      const die = new Die(`die_${i}`);
      this.model.addDie(die);
    }
  }

  /**
   * Cleanup resources.
   */
  dispose(): void {
    // Controller doesn't own resources in MVC pattern
  }
}
