import { GUI } from "dat.gui";
import { useControls } from "./controls";
import { useGraphicsContainer } from "./graphics-container";
import { useEffect, useRef } from "react";
import { GameController } from "./controller";
import { GameModel } from "./model";
import { GameView } from "./view";
import type { Nullable } from "./types";
import { TableGraphics } from "@/graphics/objects";
import { AmbientLight, DirectionalLight, Scene, type Camera } from "three";

function useDebugGui(camera: Camera, gameController: Nullable<GameController>) {
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
      cameraFolder.close();

      const gameFolder = debugGui.current.addFolder("Game Actions");
      gameFolder.add({
        rollDice: async () => {
          const result = await gameController?.handleAction({ type: 'ROLL_DICE' });
          console.log(result);
        }
      }, 'rollDice').name('Roll Dice');
      gameFolder.add({
        resetGame: async () => {
          const result = await gameController?.handleAction({ type: 'RESET_GAME' });
          console.log(result);
        }
      }, 'resetGame').name('Reset Game');
      gameFolder.open();
    }

    return () => {
      debugGui.current?.destroy();
      debugGui.current = null;
    }

  }, [debugGui.current, camera, gameController]);
}

export function useGame() {
  const { renderer, camera, rootScene, renderScene } = useGraphicsContainer("game-container");
  const modelRef = useRef<GameModel | null>(null);
  const controllerRef = useRef<GameController | null>(null);
  const viewRef = useRef<GameView | null>(null);
  const tableRef = useRef<TableGraphics | null>(null);

  useEffect(() => {

    configureLighting(rootScene.object3D);

    // Create table once and store reference
    if (!tableRef.current) {
      tableRef.current = new TableGraphics();
      tableRef.current.addTo(rootScene.object3D);
    }

    // Initialize MVC components
    if (!modelRef.current && !controllerRef.current && !viewRef.current) {
      // Create Model
      const model = new GameModel();
      modelRef.current = model;

      // Create Controller
      const controller = new GameController(model);
      controllerRef.current = controller;

      // Create View (passes table and action handler to relay user input to controller)
      const view = new GameView(tableRef.current, model, async (action) => {
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
      tableRef.current?.dispose();
      viewRef.current = null;
      controllerRef.current = null;
      modelRef.current = null;
      tableRef.current = null;
    };
  }, [rootScene, renderScene]);

  useControls(camera, renderer.domElement, renderScene);
  useDebugGui(camera, controllerRef.current);
}

function configureLighting(scene: Scene) {
  const ambientLight = new AmbientLight(0xffffff, 0.75);
  scene.add(ambientLight);

  const directionalLight = new DirectionalLight(0xffffff, 1.8);
  directionalLight.position.set(-15, 50, 0);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
}
