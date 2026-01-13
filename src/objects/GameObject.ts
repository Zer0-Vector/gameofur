import type { IGameObject, GameObjectType, GameObjectState } from '../interfaces';

/**
 * Base class for all game objects.
 * Provides common functionality for game logic.
 */
export abstract class GameObject<Type extends GameObjectType> implements IGameObject<Type> {
  public readonly id: string;
  public abstract readonly type: Type;
  public state: GameObjectState;

  constructor(id: string) {
    this.id = id;
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
