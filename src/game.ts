import { GUI } from "dat.gui";
import { useGameTable } from "./board";
import { useControls } from "./controls";
import { useGraphicsContainer } from "./graphics-container";
import * as THREE from "three";
import { useEffect, useRef } from "react";

function useDebugGui(camera: THREE.Camera) {
  const debugGui = useRef<GUI | null>(null);
  useEffect(() => {
    if (!debugGui.current) {
      debugGui.current = new GUI();
      const cameraFolder = debugGui.current.addFolder("Camera");
      const cameraPositionFolder = cameraFolder.addFolder("Position");
      cameraPositionFolder.add(camera.position, "x", -100, 100, 0.01).listen();
      cameraPositionFolder.add(camera.position, "y", -100, 100, 0.01).listen();
      cameraPositionFolder.add(camera.position, "z", -100, 100, 0.01).listen();
      cameraPositionFolder.open();
      const cameraRotationFolder = cameraFolder.addFolder("Rotation");
      cameraRotationFolder.add(camera.rotation, "x", -Math.PI, Math.PI, 0.01).listen();
      cameraRotationFolder.add(camera.rotation, "y", -Math.PI, Math.PI, 0.01).listen();
      cameraRotationFolder.add(camera.rotation, "z", -Math.PI, Math.PI, 0.01).listen();
      cameraRotationFolder.open();
      cameraFolder.open();
    }

    return () => {
      debugGui.current?.destroy();
      debugGui.current = null;
    }

  }, [debugGui, camera]);
}

export function useGame() {
  const { renderer, camera, rootScene, renderScene } = useGraphicsContainer("game-container");
  rootScene.background = new THREE.Color(0x2a2a2a);
  configureLighting(rootScene);
  useControls(camera, renderer.domElement, renderScene);

  const table = useGameTable();
  rootScene.add(table);

  useDebugGui(camera);

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
