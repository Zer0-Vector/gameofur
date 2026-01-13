import * as THREE from 'three';
import { GraphicsObject, type AnimationParams, type AnimationType } from './GraphicsObject';
import { dimensions, colors } from './constants';

/**
 * Graphics representation of a die.
 */
export class DieGraphics extends GraphicsObject {

  constructor(position: THREE.Vector3 = new THREE.Vector3()) {
    const mesh = DieGraphics.createDieMesh();
    mesh.position.copy(position);
    super(mesh);
  }

  private static createDieMesh(): THREE.Mesh {
    // Tetrahedron for 4-sided die
    const geometry = new THREE.TetrahedronGeometry(dimensions.die.size);
    const material = new THREE.MeshStandardMaterial({
      color: colors.die.base,
      roughness: dimensions.die.material.roughness,
      metalness: dimensions.die.material.metalness,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  protected async performAnimation(animation: AnimationType, _params: AnimationParams): Promise<void> {
    if (animation === 'roll') {
      return this.animateRoll();
    }
  }

  private async animateRoll(): Promise<void> {
    const duration = dimensions.die.rollDuration;
    const rotations = dimensions.die.rollRotations; // Number of full rotations

    return new Promise((resolve) => {
      const startTime = performance.now();
      const startRotation = this._object3D.rotation.clone();

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out
        const eased = 1 - Math.pow(1 - progress, 3);

        // Random rotation axes for each roll
        this._object3D.rotation.x = startRotation.x + eased * rotations * Math.PI * 2 * dimensions.die.rotationMultipliers.x;
        this._object3D.rotation.y = startRotation.y + eased * rotations * Math.PI * 2 * dimensions.die.rotationMultipliers.y;
        this._object3D.rotation.z = startRotation.z + eased * rotations * Math.PI * 2 * dimensions.die.rotationMultipliers.z;

        // Add some bounce
        const bounce = Math.sin(progress * Math.PI) * dimensions.die.bounceMultiplier;
        this._object3D.position.y += bounce * dimensions.die.bounceAmplitude;

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
