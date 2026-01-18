import type { Piece } from "@/objects";
import { Repository } from "./Repository";

/**
 * Repository for managing game pieces.
 */

export class PieceRepository extends Repository<Piece> {
  /**
   * Get pieces by player.
   */
  getByPlayer(player: "A" | "B"): Piece[] {
    return this.filter((piece) => piece.player === player);
  }

  /**
   * Get pieces at a specific position.
   */
  getAtPosition(position: string): Piece[] {
    return this.filter((piece) => piece.position === position);
  }

}
