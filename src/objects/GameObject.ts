
/**
 * Base class for all game objects.
 * Provides common functionality for game logic.
 */
export abstract class GameObject<Type extends GameObjectType> {
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


export type GameObjectType = 'piece' | 'space' | 'die' | 'board';

export interface GameObjectState {
  /** Whether the object is currently active/interactable */
  active: boolean;
  
  /** Whether the object is currently selected */
  selected: boolean;
  
  /** Whether the object is currently animating */
  animating: boolean;
}
