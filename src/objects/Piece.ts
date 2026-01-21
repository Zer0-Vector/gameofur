import type { Player } from "@/types/game";
import { GameObject } from './GameObject';

/**
 * Represents a game piece.
 */
export class Piece extends GameObject<"piece"> {
  public readonly type = "piece";
  public readonly player: Player;
  public position: string | null;
  public finished: boolean;

  constructor(index: number, player: Player) {
    super(`PIECE-${player}${index}`);
    this.player = player;
    this.position = null;
    this.finished = false;
  }

  update(_deltaTime: number): void {
    // Update piece logic if needed
  }

  moveTo(position: string): void {
    this.position = position;
  }

  returnToStart(): void {
    this.position = null;
    this.finished = false;
  }

  finish(): void {
    this.finished = true;
    this.position = 'F';
  }

  override reset(): void {
    super.reset();
    this.position = null;
    this.finished = false;
  }
}
