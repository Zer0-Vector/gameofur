import type { SpaceNotation } from '@/types/game';
import { GameObject } from './GameObject';
import type { Piece } from './Piece';
import type { Nullable } from '@/types';

/**
 * Represents a space on the game board.
 */
export class Space extends GameObject<"space"> {
  public readonly type = "space";
  public readonly notation: SpaceNotation;
  public readonly isRosette: boolean;
  public occupant: Nullable<Piece>;

  constructor(notation: SpaceNotation, isRosette: boolean = false) {
    super(`SPACE-${notation}`);
    this.notation = notation;
    this.isRosette = isRosette;
    this.occupant = null;
  }

  update(_deltaTime: number): void {
    // Update space logic if needed
  }

  placePiece(piece: Piece): void {
    this.occupant = piece;
    piece.moveTo(this.id);
  }

  removePiece(): Nullable<Piece> {
    const piece = this.occupant;
    this.occupant = null;
    return piece;
  }

  canOccupy(piece: Piece): boolean {
    // Can't occupy if already occupied by same player
    if (this.occupant?.owner === piece.owner) {
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
