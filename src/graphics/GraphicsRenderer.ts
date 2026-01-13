import * as THREE from 'three';
import type { IGraphicsObject } from '../interfaces';

/**
 * Manages all graphics objects and rendering.
 * Provides a unified interface for drawing and animating.
 */
export class GraphicsRenderer {
  private readonly scene: THREE.Scene;
  private readonly graphicsObjects: Map<string, IGraphicsObject>;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.graphicsObjects = new Map();
  }

  /**
   * Register a graphics object and draw it to the scene.
   */
  addObject(id: string, graphicsObject: IGraphicsObject): void {
    this.graphicsObjects.set(id, graphicsObject);
    graphicsObject.addTo(this.scene);
  }

  /**
   * Remove a graphics object from the scene.
   */
  removeObject(id: string): void {
    const graphicsObject = this.graphicsObjects.get(id);
    if (graphicsObject) {
      graphicsObject.removeFrom(this.scene);
      graphicsObject.dispose();
      this.graphicsObjects.delete(id);
    }
  }

  /**
   * Get a graphics object by ID.
   */
  getObject(id: string): IGraphicsObject | undefined {
    return this.graphicsObjects.get(id);
  }

  /**
   * Update all graphics objects (called each frame).
   */
  updateAll(deltaTime: number): void {
    this.graphicsObjects.forEach((obj) => {
      obj.updateVisuals(deltaTime);
    });
  }

  /**
   * Trigger an animation on a specific object.
   */
  async animate(id: string, animation: string, params?: any): Promise<void> {
    const graphicsObject = this.graphicsObjects.get(id);
    if (graphicsObject) {
      await graphicsObject.animate(animation as any, params);
    }
  }

  /**
   * Clear all graphics objects.
   */
  clear(): void {
    this.graphicsObjects.forEach((_obj, id) => {
      this.removeObject(id);
    });
  }

  /**
   * Dispose of all resources.
   */
  dispose(): void {
    this.clear();
  }
}
