import { MeshStandardMaterial, BoxGeometry, Mesh, Vector3, Color, TextureLoader, LinearSRGBColorSpace } from 'three';
import type { ColorRepresentation, Texture } from 'three';
import { GraphicsObject, type AnimationParams, type AnimationType } from '@/graphics';
import { dimensions, positions, colors } from '@/graphics/constants';

/**
 * Graphics representation of a board space.
 */
export class SpaceGraphics extends GraphicsObject<Mesh> {

  private static readonly selectionColor = new Color(colors.space.selection);
  private static readonly textureLoader = new TextureLoader();

  constructor(coordinate: string, color: ColorRepresentation, position: Vector3, texturePath: string) {
    super(`space-${coordinate}`, SpaceGraphics.createSpaceMesh(color, position, texturePath));
  }

  private static createSpaceMesh(color: ColorRepresentation, position: Vector3, texturePath: string): Mesh {
    const geometry = new BoxGeometry(dimensions.space.width, dimensions.space.height, dimensions.space.depth);
    let bodyMaterial = new MeshStandardMaterial({
      color,
      side: 2,
    })

    let faceMaterial = bodyMaterial;

    faceMaterial = new MeshStandardMaterial({
      color: new Color(0xffffff),
      roughness: dimensions.space.material.roughness,
      metalness: dimensions.space.material.metalness,
      transparent: true,
    });

    const texture = SpaceGraphics.textureLoader.load(texturePath, (loadedTexture: Texture) => {
      loadedTexture.colorSpace = LinearSRGBColorSpace;
      faceMaterial.map = loadedTexture;
      faceMaterial.needsUpdate = true;
    });
    faceMaterial.map = texture;

    const materials = [
      bodyMaterial,
      faceMaterial,
    ];

    geometry.groups.forEach((face, index) => {
      face.materialIndex = index === 2 ? 1 : 0; // Apply faceMaterial to top face only
    })

    const mesh = new Mesh(geometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.copy(position);

    return mesh;
  }

  protected async performAnimation(animation: AnimationType, _params: AnimationParams): Promise<void> {
    // TODO
  }
}
