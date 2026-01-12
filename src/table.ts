import * as THREE from 'three';
import type { BoxDimensions } from './geometry-types';

export function useGameTable(): THREE.Object3D {
  const tableGroup = new THREE.Group();
  const gameBoard = createGameBoard();
  tableGroup.add(gameBoard);
  return tableGroup;
}

// constants for board dimensions
const spaceSize = 10;
const spaceGap = 0.5;
const spaceDimensions = {
  width: spaceSize,
  height: spaceSize,
  thickness: 1,
  gap: spaceGap,
}
const borderDimensions = {
  width: 1,
  height: 1,
}
const boardDimensions = {
  width: spaceDimensions.width * 3 + spaceDimensions.gap * 4 + borderDimensions.width * 2,
  height: spaceDimensions.height * 8 + spaceDimensions.gap * 9 + borderDimensions.height * 2,
  thickness: 1,
  bevelSize: 0.25,
  border: {
    width: borderDimensions.width,
    height: borderDimensions.height,
  }
}

function createGameBoard() {
  const boardGroup = new THREE.Group();
  const base = createBoardBase();
  const spaces = createSpaces();
  boardGroup.add(base);
  spaces.forEach(space => boardGroup.add(space));
  return boardGroup;
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
  base.add(border);

  const box = createBoardBox(boardMaterial);
  base.add(box);

  base.rotation.set(0, Math.PI / 2, 0);

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
    { width: boardDimensions.width, height: boardDimensions.height }, boardDimensions.border.width, boardDimensions.thickness, boardDimensions.bevelSize);
  const border = new THREE.Mesh(borderGeometry, material);
  border.position.y = boardDimensions.border.height / 2;
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

