import type { DieId, PipValue } from '@/types/game';
import { GameObject } from './GameObject';


/**
 * Represents a four-sided die (binary: 0 or 1).
 */
export class Die extends GameObject<"die"> {
  public value: PipValue;
  public isRolling: boolean;
  public readonly type = "die";

  constructor(id: DieId) {
    super(id);
    this.value = 0;
    this.isRolling = false;
  }

  update(_deltaTime: number): void {
    // Update die physics/animation if needed
  }

  async roll(): Promise<PipValue> {
    this.isRolling = true;
    this.state.animating = true;

    // Simulate rolling duration
    await new Promise(resolve => setTimeout(resolve, 500));

    this.value = Math.random() > 0.5 ? 1 : 0;
    this.isRolling = false;
    this.state.animating = false;

    return this.value;
  }

  override reset(): void {
    super.reset();
    this.value = 0;
    this.isRolling = false;
  }
}
