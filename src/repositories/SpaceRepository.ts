import type { Space } from "@/objects";
import { Repository } from "./Repository";

/**
 * Repository for managing board spaces.
 */

export class SpaceRepository extends Repository<Space> {
  /**
   * Get space by notation (e.g., "a1", "m4").
   */
  getByNotation(notation: string): Space | undefined {
    return this.find((space) => space.notation === notation.toLocaleLowerCase());
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
