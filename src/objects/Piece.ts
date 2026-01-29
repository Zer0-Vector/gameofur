import type { PlayerId, SpaceId } from "@/types/game";
import { GameObject } from './GameObject';

/**
 * Represents a game piece.
 */
export class Piece extends GameObject<"piece"> {
  public readonly type = "piece";
  public readonly owner: PlayerId;
  public position: SpaceId;

  constructor(index: number, owner: PlayerId) {
    super(`PIECE-${owner}${index}`);
    this.owner = owner;
    this.position = `${owner}-START`;
  }

  get finished(): boolean {
    return this.position === `${this.owner}-FINISH`;
  }

  update(_deltaTime: number): void {
    // Update piece logic if needed
  }

  moveTo(position: SpaceId): void {
    this.position = position;
  }

  returnToStart(): void {
    this.position = `${this.owner}-START`;
  }

  override reset(): void {
    super.reset();
    this.returnToStart();
  }
}
