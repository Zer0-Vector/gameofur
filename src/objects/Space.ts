import type { ISpace, IPiece } from '../interfaces';
import { GameObject } from './GameObject';

/**
 * Represents a space on the game board.
 */
export class Space extends GameObject implements ISpace {
  public readonly notation: string;
  public readonly isRosette: boolean;
  public occupant: IPiece | null;

  constructor(id: string, notation: string, isRosette: boolean = false) {
    super(id, 'space');
    this.notation = notation;
    this.isRosette = isRosette;
    this.occupant = null;
  }

  update(_deltaTime: number): void {
    // Update space logic if needed
  }

  placePiece(piece: IPiece): void {
    this.occupant = piece;
    piece.moveTo(this.notation);
  }

  removePiece(): IPiece | null {
    const piece = this.occupant;
    this.occupant = null;
    return piece;
  }

  canOccupy(piece: IPiece): boolean {
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
