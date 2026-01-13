import { GameObject } from './GameObject';
import type { Piece } from './Piece';

/**
 * Represents a space on the game board.
 */
export class Space extends GameObject<"space"> {
  public readonly type = "space";
  public readonly notation: string;
  public readonly isRosette: boolean;
  public occupant: Piece | null;

  constructor(id: string, notation: string, isRosette: boolean = false) {
    super(id);
    this.notation = notation;
    this.isRosette = isRosette;
    this.occupant = null;
  }

  update(_deltaTime: number): void {
    // Update space logic if needed
  }

  placePiece(piece: Piece): void {
    this.occupant = piece;
    piece.moveTo(this.notation);
  }

  removePiece(): Piece | null {
    const piece = this.occupant;
    this.occupant = null;
    return piece;
  }

  canOccupy(piece: Piece): boolean {
    // Can't occupy if already occupied by same player
    if (this.occupant && this.occupant.player === piece.player) {
      return false;
    }

    // Rosettes are safe - can't knock out pieces on rosettes
    if (this.isRosette && this.occupant) {
      return false;
    }

    return true;
  }

  override reset(): void {
    super.reset();
    this.occupant = null;
  }
}
