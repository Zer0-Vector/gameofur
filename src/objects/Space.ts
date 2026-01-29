import type { SpaceId } from '@/types/game';
import { GameObject } from './GameObject';
import type { Piece } from './Piece';
import type { Maybe } from '@/types';

/**
 * Represents a space on the game board.
 */
export class Space extends GameObject<"space"> {
  public readonly type = "space";
  public readonly isRosette: boolean;
  public occupant: Maybe<Piece>;

  constructor(notation: SpaceId, isRosette: boolean = false) {
    super(notation);
    this.isRosette = isRosette;
    this.occupant = undefined;
  }

  update(_deltaTime: number): void {
    // Update space logic if needed
  }

  placePiece(piece: Piece): void {
    this.occupant = piece;
    piece.moveTo(this.id);
  }

  removePiece(): Maybe<Piece> {
    const piece = this.occupant;
    this.occupant = undefined;
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
    this.occupant = undefined;
  }
}
