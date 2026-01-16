import { GraphicsObject, type AnimationParams, type AnimationType } from '@/graphics';
import { dimensions, colors } from '@/graphics/constants';
import { BufferAttribute, Color, Mesh, MeshStandardMaterial, TetrahedronGeometry, Vector3 } from 'three';

/**
 * Graphics representation of a die.
 */
export class DieGraphics extends GraphicsObject<Mesh> {

  constructor(id: string, position: Vector3 = new Vector3()) {
    const mesh = DieGraphics.createDieMesh(id);
    mesh.position.copy(position);
    super(id, mesh);
  }

  private static createDieMesh(id: string): Mesh {
    // Tetrahedron for 4-sided die
    const geometry = new TetrahedronGeometry(dimensions.die.size);
    
    const material = new MeshStandardMaterial({
      roughness: dimensions.die.material.roughness,
      metalness: dimensions.die.material.metalness,
      flatShading: true,
      color: colors.die.body,
    });

    const pipMaterial = material.clone();
    pipMaterial.color = new Color(colors.die.pip);

    const positions = geometry.attributes.position;

    const pipScale = 0.15;
    const pipPositionScale = 1 - pipScale + 0.01;

    const pip1 = new Mesh(geometry.clone(), pipMaterial);
    pip1.position.set(
      positions.getX(0),
      positions.getY(0),
      positions.getZ(0)
    );
    pip1.position.multiplyScalar(pipPositionScale);
    pip1.scale.setScalar(0.15);

    const pip2 = new Mesh(geometry.clone(), pipMaterial);
    pip2.position.set(
      positions.getX(2),
      positions.getY(2),
      positions.getZ(2)
    );
    pip2.position.multiplyScalar(pipPositionScale);
    pip2.scale.setScalar(0.15);

    

    const dieMesh = new Mesh(geometry, material);
    dieMesh.castShadow = true;
    dieMesh.receiveShadow = false;
    dieMesh.name = id;

    dieMesh.add(pip1);
    dieMesh.add(pip2);

    return dieMesh;
  }

  protected async performAnimation(animation: AnimationType, _params: AnimationParams): Promise<void> {
    if (animation === 'roll') {
      return this.animateRoll();
    }
  }

  private async animateRoll(): Promise<void> {
    // TODO: review and test
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
