import * as THREE from 'three';
import type { BoxDimensions } from './geometry-types';

export function useBoard(): THREE.Object3D {
  const boardGroup = new THREE.Group();
  const base = createBoardBase();
  const spaces = createSpaces();
  boardGroup.add(base);
  spaces.forEach(space => boardGroup.add(space));
  return boardGroup;
}

// constants for board dimensions
const spaceSize = 10;
const spaceGap = 0.5;
const borderDimensions = {
  width: 1,
  height: 1,
}
const boardDimensions = {
  width: spaceSize * 3 + spaceGap * 4 + borderDimensions.width * 2,
  height: spaceSize * 8 + spaceGap * 9 + borderDimensions.width * 2,
  thickness: 1,
  bevelSize: 1,
}

function createBoardBase() {
  const base = new THREE.Group();

  // Create the raised border
  const boardMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B4513,
    roughness: 0.7,
    metalness: 0.1
  });

  const border = createRaisedBorder(boardMaterial);
  const box = createBoardBox(boardMaterial);

  base.add(border);
  base.add(box);
  return base;
}

function createSpaces(): THREE.Object3D[] {
  const spaces: THREE.Object3D[] = [];
  return spaces;
}

function createBoardBox(material: THREE.Material): THREE.Object3D {
  const { width, height, thickness } = boardDimensions;
  const boardGeometry = new THREE.BoxGeometry(width, thickness, height);

  const board = new THREE.Mesh(boardGeometry, material);
  board.position.y = 0;
  board.receiveShadow = true;
  board.castShadow = true;

  return board;
}

function createRaisedBorder(material: THREE.Material): THREE.Object3D {
  const borderGeometry = createRaisedBorderGeometry(
    { width: boardDimensions.width, height: boardDimensions.height }, borderDimensions.width, boardDimensions.thickness, boardDimensions.bevelSize);
  const border = new THREE.Mesh(borderGeometry, material);
  border.position.y = borderDimensions.height / 2;
  border.rotation.x = -Math.PI / 2;
  border.castShadow = true;
  border.receiveShadow = true;
  return border;
}

function createRaisedBorderGeometry(outerSize: BoxDimensions, borderWidth: number, height: number, bevelSize: number) {
  const halfWidth = outerSize.width / 2;
  const halfHeight = outerSize.height / 2;
  const halfInnerWidth = halfWidth - borderWidth;
  const halfInnerHeight = halfHeight - borderWidth;

  // Outer rectangle shape
  const outerShape = new THREE.Shape();
  outerShape.moveTo(-halfWidth, -halfHeight);
  outerShape.lineTo(halfWidth, -halfHeight);
  outerShape.lineTo(halfWidth, halfHeight);
  outerShape.lineTo(-halfWidth, halfHeight);
  outerShape.lineTo(-halfWidth, -halfHeight);
  // Inner rectangle hole (cutout)
  const innerHole = new THREE.Path();
  innerHole.moveTo(-halfInnerWidth, -halfInnerHeight);
  innerHole.lineTo(-halfInnerWidth, halfInnerHeight);
  innerHole.lineTo(halfInnerWidth, halfInnerHeight);
  innerHole.lineTo(halfInnerWidth, -halfInnerHeight);
  innerHole.lineTo(-halfInnerWidth, -halfInnerHeight);

  outerShape.holes.push(innerHole);

  // Extrude with bevel for nice rounded top edge

  return new THREE.ExtrudeGeometry(outerShape, {
    depth: height,
    bevelEnabled: true,
    bevelThickness: bevelSize,
    bevelSize: bevelSize,
    bevelSegments: 15
  });
}

