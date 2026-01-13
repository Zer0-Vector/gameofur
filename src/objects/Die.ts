import type { IDie } from '../interfaces';
import { GameObject } from './GameObject';

/**
 * Represents a four-sided die (binary: 0 or 1).
 */
export class Die extends GameObject implements IDie {
  public value: 0 | 1;
  public isRolling: boolean;

  constructor(id: string) {
    super(id, 'die');
    this.value = 0;
    this.isRolling = false;
  }

  update(_deltaTime: number): void {
    // Update die physics/animation if needed
  }

  async roll(): Promise<0 | 1> {
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
