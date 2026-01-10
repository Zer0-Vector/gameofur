import { useBoard } from "./board";
import { useControls } from "./controls";
import { useGraphicsContainer } from "./graphics-container";
import * as THREE from "three";

export function useGame() {
  const { renderer, camera, rootScene, renderScene } = useGraphicsContainer("game-container");
  rootScene.background = new THREE.Color(0x2a2a2a);
  configureLighting(rootScene);
  useControls(camera, renderer.domElement, renderScene);

  const board = useBoard();
  rootScene.add(board);

  renderScene();
}

function configureLighting(scene: THREE.Scene) {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
  directionalLight.position.set(10, 20, 10);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
}
