import type { TypedObject } from "./TypeGameObject";

/**
 * Base interface for all game objects.
 * Separates game logic from graphics.
 */
export interface IGameObject<Type extends GameObjectType> extends TypedObject<GameObjectType, Type> {
  
  /** Current state of the game object */
  state: GameObjectState;
  
  /** Update the game object's state */
  update(deltaTime: number): void;
  
  /** Reset the game object to its initial state */
  reset(): void;
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
