import type { IGameObject } from './IGameObject';

/**
 * Interface for a game piece.
 */
export interface IPiece extends IGameObject<"piece"> {
  /** Player who owns this piece */
  player: 'A' | 'B';

  /** Current position on the board (null if not on board) */
  position: string | null;

  /** Whether the piece has finished the game */
  finished: boolean;

  /** Move the piece to a new position */
  moveTo(position: string): void;

  /** Return the piece to the starting area */
  returnToStart(): void;

  /** Mark the piece as finished */
  finish(): void;
}
