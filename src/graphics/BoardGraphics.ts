import { GraphicsObject, type AnimationParams, type AnimationType } from "./GraphicsObject";
import { Group, MeshStandardMaterial, BoxGeometry, Mesh, Shape, Path, ExtrudeGeometry, Vector3 } from "three";
import type { Object3D, Material } from "three";
import { dimensions } from "./constants";
import type { BoxDimensions } from "../types/geometry";

export class BoardGraphics extends GraphicsObject {
  protected performAnimation(_animation: AnimationType, _params: AnimationParams): Promise<void> {
    // nop
    return Promise.resolve();
  }

  constructor(position: Vector3 = new Vector3()) {
    super("board", BoardGraphics.createBoardObject(position));
  }
  
  private static createBoardObject(position: Vector3): Object3D {
    const boardGroup = new Group();
    boardGroup.position.copy(position);
    
    const boardMaterial = new MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.7,
      metalness: 0.1
    });

    const border = BoardGraphics.createRaisedBorder(boardMaterial);
    boardGroup.add(border);

    const box = BoardGraphics.createBoardBox(boardMaterial);
    boardGroup.add(box);

    // Rotate the board to proper orientation
    boardGroup.rotation.set(0, Math.PI / 2, 0);
    
    return boardGroup;
  }

  private static createBoardBox(material: Material): Object3D {
    const { width, height, thickness } = dimensions.board;
    const boardGeometry = new BoxGeometry(width, thickness, height);

    const board = new Mesh(boardGeometry, material);
    board.position.y = 0;
    board.receiveShadow = true;
    board.castShadow = true;

    return board;
  }

  private static createRaisedBorder(material: Material): Object3D {
    const { width, height, thickness, bevelSize, border } = dimensions.board;
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