import type { Disposable, Identifiable } from '@/interfaces';
import { Mesh, MathUtils } from 'three';
import type { Euler, Object3D, Vector3 } from 'three';

/**
 * Base class for all graphics objects.
 * Handles Three.js rendering and animations.
 */
export abstract class GraphicsObject<T extends Object3D> implements Disposable, Identifiable {
  protected _object3D: T;
  protected activeAnimations: Map<string, Promise<void>>;
  readonly id: string;

  constructor(id: string, object3D: T) {
    this.id = id;
    this._object3D = object3D;
    this._object3D.name = id;
    this._object3D.userData.graphicsObject = this;
    this.activeAnimations = new Map();
  }

  get object3D(): T {
    return this._object3D;
  }

  addTo(parent: Object3D): void {
    parent.add(this._object3D);
  }

  removeFrom(parent: Object3D): void {
    parent.remove(this._object3D);
  }

  async animate(animation: AnimationType, params: AnimationParams = {}): Promise<void> {
    // Cancel any existing animation of the same type
    const existing = this.activeAnimations.get(animation);
    if (existing) {
      await existing;
    }

    const animationPromise = this.performAnimation(animation, params);
    this.activeAnimations.set(animation, animationPromise);

    await animationPromise;
    this.activeAnimations.delete(animation);
  }

  protected abstract performAnimation(animation: AnimationType, params: AnimationParams): Promise<void>;

  updateVisuals(_deltaTime: number): void {
    // Override in subclasses if needed
  }

  dispose(): void {
    // Dispose of geometries and materials
    this._object3D.traverse((obj) => {
      if (obj instanceof Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(mat => mat.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
  }

  /**
   * Utility method for animating position/rotation/scale over time.
   */
  protected async animateTransform(params: AnimationParams): Promise<void> {
    const duration = params.duration || 500;
    const easing = params.easing || ((t: number) => t); // Linear by default
    const startTime = performance.now();

    const startPosition = this._object3D.position.clone();
    const startRotation = this._object3D.rotation.clone();
    const startScale = this._object3D.scale.clone();

    const targetPosition = params.targetPosition || startPosition;
    const targetRotation = params.targetRotation || startRotation;
    const targetScale = params.targetScale || startScale;

    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(progress);

        this._object3D.position.lerpVectors(startPosition, targetPosition, easedProgress);
        this._object3D.rotation.set(
          MathUtils.lerp(startRotation.x, targetRotation.x, easedProgress),
          MathUtils.lerp(startRotation.y, targetRotation.y, easedProgress),
          MathUtils.lerp(startRotation.z, targetRotation.z, easedProgress)
        );
        this._object3D.scale.lerpVectors(startScale, targetScale, easedProgress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  }
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
  targetPosition?: Vector3;
  targetRotation?: Euler;
  targetScale?: Vector3;
  easing?: (t: number) => number;

}
