import { MeshStandardMaterial, BoxGeometry, Mesh, Vector3, Color } from 'three';
import type { ColorRepresentation } from 'three';
import { GraphicsObject } from './GraphicsObject';
import type { AnimationType, AnimationParams } from '../interfaces';
import { dimensions, positions, colors } from './constants';

/**
 * Graphics representation of a board space.
 */
export class SpaceGraphics extends GraphicsObject {
  private readonly material: MeshStandardMaterial;
  private readonly baseColor: Color;

  private static readonly selectionColor = new Color(colors.space.selection);

  constructor(color: ColorRepresentation, position: Vector3) {
    super(SpaceGraphics.createSpaceMesh(color, position));


    const meshMaterial = (this._object3D as Mesh).material;
    if (Array.isArray(meshMaterial)) {
      throw new TypeError('Unexpected material array');
    }
    this.material = meshMaterial as MeshStandardMaterial;
    this.baseColor = this.material.color.clone();
  }

  private static createSpaceMesh(color: ColorRepresentation, position: Vector3): Mesh {
    const geometry = new BoxGeometry(dimensions.space.width, dimensions.space.height, dimensions.space.depth);
    const material = new MeshStandardMaterial({
      color,
      roughness: dimensions.space.material.roughness,
      metalness: dimensions.space.material.metalness,
    });

    const mesh = new Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.copy(position);
    return mesh;
  }

  protected async performAnimation(animation: AnimationType, _params: AnimationParams): Promise<void> {
    switch (animation) {
      case 'highlight':
        return this.animateHighlight();
      case 'unhighlight':
        return this.animateUnhighlight();
      case 'select':
        return this.animateSelect();
      case 'deselect':
        return this.animateDeselect();
      default:
    }
  }

  private async animateHighlight(): Promise<void> {
    this.material.emissive = new Color(colors.emissive.highlightSpace);
    this.material.emissiveIntensity = positions.animation.emissive.highlight.intensity;
    return this.animateTransform({
      targetPosition: new Vector3(
        this._object3D.position.x,
        this._object3D.position.y + dimensions.space.highlightOffset,
        this._object3D.position.z
      ),
      duration: dimensions.space.highlightDuration,
    });
  }

  private async animateUnhighlight(): Promise<void> {
    this.material.emissive = new Color(colors.emissive.none);
    this.material.emissiveIntensity = 0;
    return this.animateTransform({
      targetPosition: new Vector3(
        this._object3D.position.x,
        this._object3D.position.y - dimensions.space.highlightOffset,
        this._object3D.position.z
      ),
      duration: dimensions.space.unhighlightDuration,
    });
  }

  private async animateSelect(): Promise<void> {
    this.material.color = SpaceGraphics.selectionColor;
  }

  private async animateDeselect(): Promise<void> {
    this.material.color = this.baseColor;
  }
}
