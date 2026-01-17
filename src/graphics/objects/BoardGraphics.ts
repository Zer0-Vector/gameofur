import { GraphicsObject, type AnimationParams, type AnimationType } from "@/graphics";
import { Group, MeshStandardMaterial, BoxGeometry, Mesh, Shape, Path, ExtrudeGeometry, Vector3 } from "three";
import type { Object3D, Material } from "three";
import { dimensions } from "@/graphics/constants";
import type { BoxDimensions } from "@/types/geometry";
import type { SpaceGraphics } from "./SpaceGraphics";

export class BoardGraphics extends GraphicsObject {
  protected performAnimation(_animation: AnimationType, _params: AnimationParams): Promise<void> {
    // nop
    return Promise.resolve();
  }

  constructor(position: Vector3 = new Vector3()) {
    super("board", BoardGraphics.createBoardObject(position));
  }

  /**
   * Add a space as a child of this board.
   */
  addSpace(space: SpaceGraphics): void {
    space.addTo(this._object3D);
  }

  /**
   * Get a space by ID using the Three.js scene graph.
   */
  getSpace(id: string): SpaceGraphics | undefined {
    const obj = this._object3D.getObjectByName(id);
    return obj?.userData.graphicsObject as SpaceGraphics | undefined;
  }

  /**
   * Animate a space by ID.
   */
  async animateSpace(id: string, animation: AnimationType, params?: AnimationParams): Promise<void> {
    const space = this.getSpace(id);
    if (space) {
      await space.animate(animation, params);
    }
  }

  private static createBoardObject(position: Vector3) {

    const boardMaterial = new MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.7,
      metalness: 0.1
    });
    const box = BoardGraphics.createBoardBox(boardMaterial);

    const border = BoardGraphics.createRaisedBorder(boardMaterial);
    box.add(border);


    box.position.copy(position);
    box.translateY(dimensions.board.height / 2);

    return box;
  }

  private static createBoardBox(material: Material): Object3D {
    const { width, depth: height, height: thickness } = dimensions.board;
    const boardGeometry = new BoxGeometry(width, thickness, height);

    const board = new Mesh(boardGeometry, material);
    board.position.y = 0;
    board.receiveShadow = true;
    board.castShadow = true;

    return board;
  }

  private static createRaisedBorder(material: Material): Object3D {
    const { width, depth: height, height: thickness, bevelSize, border } = dimensions.board;
    const borderGeometry = BoardGraphics.createRaisedBorderGeometry(
      { width, height }, border.width, thickness, bevelSize);
    const borderMesh = new Mesh(borderGeometry, material);
    borderMesh.position.y = border.height / 2;
    borderMesh.rotation.x = -Math.PI / 2;
    borderMesh.castShadow = true;
    borderMesh.receiveShadow = true;
    return borderMesh;
  }

  private static createRaisedBorderGeometry(outerSize: BoxDimensions, borderWidth: number, height: number, bevelSize: number) {
    const halfWidth = outerSize.width / 2;
    const halfHeight = outerSize.height / 2;
    const halfInnerWidth = halfWidth - borderWidth;
    const halfInnerHeight = halfHeight - borderWidth;

    // Outer rectangle shape
    const outerShape = new Shape();
    outerShape.moveTo(-halfWidth, -halfHeight);
    outerShape.lineTo(halfWidth, -halfHeight);
    outerShape.lineTo(halfWidth, halfHeight);
    outerShape.lineTo(-halfWidth, halfHeight);
    outerShape.lineTo(-halfWidth, -halfHeight);

    // Inner rectangle hole (cutout)
    const innerHole = new Path();
    innerHole.moveTo(-halfInnerWidth, -halfInnerHeight);
    innerHole.lineTo(-halfInnerWidth, halfInnerHeight);
    innerHole.lineTo(halfInnerWidth, halfInnerHeight);
    innerHole.lineTo(halfInnerWidth, -halfInnerHeight);
    innerHole.lineTo(-halfInnerWidth, -halfInnerHeight);

    outerShape.holes.push(innerHole);

    // Extrude with bevel for nice rounded top edge
    return new ExtrudeGeometry(outerShape, {
      depth: height,
      bevelEnabled: true,
      bevelThickness: bevelSize,
      bevelSize: bevelSize,
      bevelSegments: 15
    });
  }
}
