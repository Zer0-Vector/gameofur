import type { IGameObject } from './IGameObject';

/**
 * Interface for a game die.
 */
export interface IDie extends IGameObject<"die"> {
  /** Current value showing on the die (0 or 1) */
  value: 0 | 1;

  /** Roll the die and return the result */
  roll(): Promise<0 | 1>;

  /** Whether the die is currently rolling */
  isRolling: boolean;
}
