import { Mesh, MathUtils } from 'three';
import type { Object3D } from 'three';
import type { IGraphicsObject, AnimationType, AnimationParams } from '../interfaces';

/**
 * Base class for all graphics objects.
 * Handles Three.js rendering and animations.
 */
export abstract class GraphicsObject implements IGraphicsObject {
  protected _object3D: Object3D;
  protected activeAnimations: Map<string, Promise<void>>;

  constructor(object3D: Object3D) {
    this._object3D = object3D;
    this.activeAnimations = new Map();
  }

  get object3D(): Object3D {
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
