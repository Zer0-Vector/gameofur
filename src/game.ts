import { GUI } from "dat.gui";
import { useControls } from "./controls";
import { useGraphicsContainer } from "./graphics-container";
import * as THREE from "three";
import { useEffect, useRef } from "react";
import { GameController } from "./controller";
import { GameModel } from "./model";
import { GameView } from "./view";
import type { Nullable } from "./types";
import { TableGraphics } from "./graphics";

function useDebugGui(camera: THREE.Camera, gameController: Nullable<GameController>) {
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

      if (gameController) {
        const gameFolder = debugGui.current.addFolder("Game Actions");
        gameFolder.add({
          rollDice: async () => {
            const result = await gameController.handleAction({ type: 'ROLL_DICE' });
            console.log(result);
          }
        }, 'rollDice').name('Roll Dice');
        gameFolder.add({
          resetGame: () => {
            const result = gameController.handleAction({ type: 'RESET_GAME' });
            console.log(result);
          }
        }, 'resetGame').name('Reset Game');
        gameFolder.open();
      }
    }

    return () => {
      debugGui.current?.destroy();
      debugGui.current = null;
    }

  }, [debugGui, camera, gameController]);
}

export function useGame() {
  const { renderer, camera, rootScene, renderScene } = useGraphicsContainer("game-container");
  const modelRef = useRef<GameModel | null>(null);
  const controllerRef = useRef<GameController | null>(null);
  const viewRef = useRef<GameView | null>(null);
  const table = new TableGraphics();

  useEffect(() => {
    rootScene.background = new THREE.Color(0x2a2a2a);
    configureLighting(rootScene);

    table.addTo(rootScene);

    // Initialize MVC components
    if (!modelRef.current && !controllerRef.current && !viewRef.current) {
      // Create Model
      const model = new GameModel();
      modelRef.current = model;

      // Create Controller
      const controller = new GameController(model);
      controllerRef.current = controller;

      // Create View (passes action handler to relay user input to controller)
      const view = new GameView(rootScene, model, async (action) => {
        const result = await controller.handleAction(action);
        console.log(result);
      });
      viewRef.current = view;

      // Initialize game objects (controller populates the model)
      controller.initialize();
    }

    // Animation loop
    let animationId: number;
    let lastTime = performance.now();

    const animate = () => {
      const currentTime = performance.now();
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;

      // Update controller (game logic)
      if (controllerRef.current) {
        controllerRef.current.update(deltaTime);
      }

      // Update view (graphics)
      if (viewRef.current) {
        viewRef.current.update(deltaTime);
      }

      renderScene();
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      viewRef.current?.dispose();
      controllerRef.current?.dispose();
      modelRef.current?.dispose();
      table.dispose();
      viewRef.current = null;
      controllerRef.current = null;
      modelRef.current = null;
    };
  }, [rootScene, renderScene, table]);

  useControls(camera, renderer.domElement, renderScene);
  useDebugGui(camera, controllerRef.current);
}

function configureLighting(scene: THREE.Scene) {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
  directionalLight.position.set(10, 20, 10);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
}
