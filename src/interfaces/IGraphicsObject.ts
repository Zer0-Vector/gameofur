import * as THREE from 'three';

/**
 * Interface for objects that can be rendered in the 3D scene.
 * Handles all Three.js rendering concerns.
 */
export interface IGraphicsObject {
  /** The Three.js object for rendering */
  get object3D(): THREE.Object3D;

  /** Draw this object into the scene */
  addTo(scene: THREE.Scene): void;

  /** Remove this object from the scene */
  removeFrom(scene: THREE.Scene): void;

  /** Trigger an animation */
  animate(animation: AnimationType, params?: AnimationParams): Promise<void>;

  /** Update the visual representation (called each frame) */
  updateVisuals(deltaTime: number): void;

  /** Cleanup resources */
  dispose(): void;
}

export type AnimationType =
  | 'move'
  | 'select'
  | 'deselect'
  | 'highlight'
  | 'unhighlight'
  | 'roll'
  | 'knockout'
  | 'spawn';

export interface AnimationParams {
  duration?: number;
  targetPosition?: THREE.Vector3;
  targetRotation?: THREE.Euler;
  targetScale?: THREE.Vector3;
  easing?: (t: number) => number;

}
