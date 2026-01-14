import type { Die } from "@/objects";
import { Repository } from "./Repository";

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
