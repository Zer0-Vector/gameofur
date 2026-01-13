import type { IGameObject, GameObjectType, GameObjectState } from '../interfaces';

/**
 * Base class for all game objects.
 * Provides common functionality for game logic.
 */
export abstract class GameObject implements IGameObject {
  public readonly id: string;
  public readonly type: GameObjectType;
  public state: GameObjectState;

  constructor(id: string, type: GameObjectType) {
    this.id = id;
    this.type = type;
    this.state = {
      active: false,
      selected: false,
      animating: false,
    };
  }

  abstract update(deltaTime: number): void;

  reset(): void {
    this.state = {
      active: false,
      selected: false,
      animating: false,
    };
  }

  select(): void {
    this.state.selected = true;
  }

  deselect(): void {
    this.state.selected = false;
  }

  setActive(active: boolean): void {
    this.state.active = active;
  }
}
