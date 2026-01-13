import type { IGameObject } from './IGameObject';
import type { IPiece } from './IPiece';

/**
 * Interface for a board space.
 */
export interface ISpace extends IGameObject<"space"> {
  /** Notation for this space (e.g., 'a1', 'm4') */
  notation: string;

  /** Whether this space is a rosette */
  isRosette: boolean;

  /** The piece currently occupying this space (null if empty) */
  occupant: IPiece | null;

  /** Place a piece on this space */
  placePiece(piece: IPiece): void;

  /** Remove the piece from this space */
  removePiece(): IPiece | null;

  /** Check if this space can be occupied by the given piece */
  canOccupy(piece: IPiece): boolean;
}
