import { useEffect } from 'react';
import { PCFSoftShadowMap, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import type { BoxDimensions } from './types/geometry';
import { GameScene } from './graphics/scenes';

export function useGraphicsContainer(containerId: string) {
  const renderer = createRenderer();

  const camera = createCamera();


  const rootScene = new GameScene();

  const renderScene = () => {
    renderer.render(rootScene.object3D, camera);
  };


  const scaleFactor: number = 1;
  useResizeObserver(renderer, containerId,
    ((width: number, height: number) => {
      const dims = computeDimensions({ width, height }, scaleFactor);
      console.log("Resizing to: ", dims);

      renderer.setSize(dims.width, dims.height);

      camera.aspect = dims.width / dims.height;
      camera.updateProjectionMatrix();

      renderScene();
    }));

  return {
    renderer,
    camera,
    rootScene,
    renderScene
  }
}

function useResizeObserver(renderer: WebGLRenderer, containerId: string, onResize: (width: number, height: number) => void) {


  // initialize size and camera aspect
  useEffect(() => {

    const observer = new ResizeObserver((entries) => {
      if (entries[0].target.id !== containerId) {
        return;
      }
      const dims = {
        width: entries[0].contentRect.width,
        height: entries[0].contentRect.height,
      };
      console.log("Detected resize!");
      onResize(dims.width, dims.height);
    });

    const container = fetchContainer(containerId);

    observer.observe(container);


    while (container.firstChild) {
      container.firstChild.remove();
    }
    container.appendChild(renderer.domElement);

    const dims = fetchContainerDimensions();
    onResize(dims.width, dims.height);

    return () => {
      observer.unobserve(container);
    };

  }, [containerId]);
}

function createCamera() {
  const fov = 75;
  const camera = new PerspectiveCamera(fov);
  camera.position.set(0, 40, 0);
  camera.lookAt(0, 0, 0);
  return camera;
}

function createRenderer() {
  const renderer = new WebGLRenderer({
    antialias: true,
  });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  return renderer;
}

function computeDimensions(base?: BoxDimensions, scale: number = 1): BoxDimensions {
  const width = base?.width || window.innerWidth;
  const height = base?.height || window.innerHeight;
  return {
    width: width * scale,
    height: height * scale,
  }
}

function fetchContainer(containerId: string) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Element #${containerId} not found`);
    throw new Error("Container not found");
  }
  return container;
}

function fetchContainerDimensions() {
  const container = fetchContainer("game-container");
  return {
    width: container.clientWidth,
    height: container.clientHeight,
  }
}
