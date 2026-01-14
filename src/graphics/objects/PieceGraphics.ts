import { GraphicsObject, type AnimationParams, type AnimationType } from '@/graphics';
import { dimensions, positions, colors } from '@/graphics/constants';
import { Color, CylinderGeometry, Mesh, MeshStandardMaterial, Vector3 } from 'three';

/**
 * Graphics representation of a game piece.
 */
export class PieceGraphics extends GraphicsObject<Mesh> {
  private readonly baseColor: Color;
  private readonly material: MeshStandardMaterial;

  constructor(player: 'A' | 'B', index: number, position: Vector3 = new Vector3()) {
    const mesh = PieceGraphics.createPieceMesh(player);
    mesh.position.copy(position);
    super(`piece-${player}${index}`, mesh);

    this.baseColor = player === 'A' ? new Color(colors.piece.playerA) : new Color(colors.piece.playerB);
    const meshMaterial = mesh.material;
    if (Array.isArray(meshMaterial)) {
      throw new TypeError('Unexpected material array');
    }
    this.material = meshMaterial as MeshStandardMaterial;
  }

  private static createPieceMesh(player: 'A' | 'B'): Mesh {
    const geometry = new CylinderGeometry(dimensions.piece.radiusTop, dimensions.piece.radiusBottom, dimensions.piece.height, dimensions.piece.radialSegments);
    const color = player === 'A' ? colors.piece.playerA : colors.piece.playerB;
    const material = new MeshStandardMaterial({
      color,
      roughness: dimensions.piece.material.roughness,
      metalness: dimensions.piece.material.metalness,
    });

    const mesh = new Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  protected async performAnimation(animation: AnimationType, params: AnimationParams): Promise<void> {
    switch (animation) {
      case 'move':
        return this.animateMove(params);
      case 'select':
        return this.animateSelect();
      case 'deselect':
        return this.animateDeselect();
      case 'highlight':
        return this.animateHighlight();
      case 'unhighlight':
        return this.animateUnhighlight();
      case 'knockout':
        return this.animateKnockout();
      case 'spawn':
        return this.animateSpawn();
      default:
    }
  }

  private async animateMove(params: AnimationParams): Promise<void> {
    if (!params.targetPosition) return;

    // Jump arc animation
    const start = this._object3D.position.clone();
    const target = params.targetPosition.clone();
    const duration = params.duration || dimensions.piece.moveDuration;
    const arcHeight = dimensions.piece.moveArcHeight;

    return new Promise((resolve) => {
      const startTime = performance.now();

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease in-out
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        this._object3D.position.lerpVectors(start, target, eased);
        this._object3D.position.y += Math.sin(progress * Math.PI) * arcHeight;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this._object3D.position.copy(target);
          resolve();
        }
      };

      animate();
    });
  }

  private async animateSelect(): Promise<void> {
    this.material.emissive = this.baseColor;
    this.material.emissiveIntensity = positions.animation.emissive.select.intensity;
    return this.animateTransform({
      targetScale: positions.animation.scale.selected,
      duration: dimensions.piece.selectDuration,
    });
  }

  private async animateDeselect(): Promise<void> {
    this.material.emissive = new Color(colors.emissive.none);
    this.material.emissiveIntensity = 0;
    return this.animateTransform({
      targetScale: positions.animation.scale.normal,
      duration: dimensions.piece.deselectDuration,
    });
  }

  private async animateHighlight(): Promise<void> {
    this.material.emissive = new Color(colors.emissive.highlightPiece);
    this.material.emissiveIntensity = positions.animation.emissive.highlight.pieceIntensity;
  }

  private async animateUnhighlight(): Promise<void> {
    this.material.emissive = new Color(colors.emissive.none);
    this.material.emissiveIntensity = 0;
  }

  private async animateKnockout(): Promise<void> {
    // Fade out and scale down
    const startOpacity = this.material.opacity;
    const duration = dimensions.piece.knockoutDuration;

    this.material.transparent = true;

    return new Promise((resolve) => {
      const startTime = performance.now();
      const startScale = this._object3D.scale.clone();

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        this.material.opacity = startOpacity * (1 - progress);
        this._object3D.scale.lerpVectors(startScale, positions.animation.scale.knockoutEnd, progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  }

  private async animateSpawn(): Promise<void> {
    // Fade in and scale up
    const duration = dimensions.piece.spawnDuration;

    this.material.transparent = true;
    this.material.opacity = positions.animation.opacity.invisible;
    this._object3D.scale.copy(positions.animation.scale.spawnStart);

    return new Promise((resolve) => {
      const startTime = performance.now();

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        this.material.opacity = progress;
        this._object3D.scale.lerpVectors(
          positions.animation.scale.spawnStart,
          positions.animation.scale.spawnEnd,
          progress
        );

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.material.transparent = false;
          this.material.opacity = positions.animation.opacity.visible;
          resolve();
        }
      };

      animate();
    });
  }
}
