import { Piece, Space, Die } from "@/objects";
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
  getAtPosition(position: string | null): Piece[] {
    return this.filter((piece) => piece.position === position);
  }

  /**
   * Reset all pieces.
   */
  resetAll(): void {
    this.forEach((piece) => piece.reset());
  }
}

/**
 * Repository for managing board spaces.
 */
export class SpaceRepository extends Repository<Space> {
  /**
   * Get space by notation (e.g., "a1", "m4").
   */
  getByNotation(notation: string): Space | undefined {
    return this.find((space) => space.notation === notation);
  }

  /**
   * Get all rosette spaces.
   */
  getRosettes(): Space[] {
    return this.filter((space) => space.isRosette);
  }

  /**
   * Get all occupied spaces.
   */
  getOccupied(): Space[] {
    return this.filter((space) => space.occupant !== null);
  }

  /**
   * Get all active (highlighted) spaces.
   */
  getActive(): Space[] {
    return this.filter((space) => space.state.active);
  }

  /**
   * Reset all spaces.
   */
  resetAll(): void {
    this.forEach((space) => space.reset());
  }
}

/**
 * Repository for managing dice.
 */
export class DieRepository extends Repository<Die> {
  /**
   * Roll all dice.
   */
  async rollAll(): Promise<number[]> {
    const rollPromises = this.getAll().map((die) => die.roll());
    return Promise.all(rollPromises);
  }

  /**
   * Reset all dice.
   */
  resetAll(): void {
    this.forEach((die) => die.reset());
  }
}
