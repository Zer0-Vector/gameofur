import { MeshStandardMaterial, BoxGeometry, Mesh, Vector3, Color, TextureLoader, SRGBColorSpace, DoubleSide, PlaneGeometry, Group } from 'three';
import type { ColorRepresentation, Texture } from 'three';
import { GraphicsObject, type AnimationParams, type AnimationType } from '@/graphics';
import { dimensions, colors } from '@/graphics/constants';

/**
 * Graphics representation of a board space.
 */
export class SpaceGraphics extends GraphicsObject {

  private static readonly selectionColor = new Color(colors.space.selection);
  private static readonly textureLoader = new TextureLoader();

  constructor(coordinate: string, color: ColorRepresentation, position: Vector3, texturePath: string) {
    super(`space-${coordinate}`, SpaceGraphics.createSpaceMesh(color, position, texturePath));
  }

  private static createSpaceMesh(color: ColorRepresentation, position: Vector3, texturePath: string) {
    const { width, height, depth } = dimensions.space;
    const { roughness, metalness } = dimensions.space.material;
    
    // create base box
    const box = new BoxGeometry(width, height, depth);
    
    const bodyMaterial = new MeshStandardMaterial({
      color,
      roughness,
      metalness,
    });
    
    const boxMesh = new Mesh(box, bodyMaterial);
    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;
    boxMesh.position.copy(position);

    const faceMaterial = new MeshStandardMaterial({
      color: 0xffffff,
      roughness,
      metalness,
      side: DoubleSide,
      transparent: true,
    });
    
    SpaceGraphics.textureLoader.load(texturePath, (loadedTexture: Texture) => {
      loadedTexture.colorSpace = SRGBColorSpace;
      faceMaterial.map = loadedTexture;
      faceMaterial.needsUpdate = true;
    });
    const plane = new PlaneGeometry(width, depth);
    
    const faceMesh = new Mesh(plane, faceMaterial);
    faceMesh.receiveShadow = true;
    faceMesh.castShadow = false;
    faceMesh.position.copy(position);
    faceMesh.position.y += height / 2 + 0.02;
    faceMesh.rotation.x = -Math.PI / 2;

    const group = new Group();
    group.add(boxMesh);
    group.add(faceMesh);

    return group;
  }

  protected async performAnimation(_animation: AnimationType, _params: AnimationParams): Promise<void> {
    // TODO
  }
}
