import { useEffect } from 'react';
import * as THREE from 'three';
import type { BoxDimensions } from './geometry-types';

export function useGraphicsContainer(containerId: string) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;


  const fov = 75;
  const camera = new THREE.PerspectiveCamera(fov);
  camera.position.set(-10, 55, 5);
  camera.lookAt(0, 0, 0);

  const rootScene = new THREE.Scene();

  const renderScene = () => {
    console.log("Rendering scene...", "\n");
    renderer.render(rootScene, camera);
  };

  const scaleFactor: number = 1;
  const doResize = (width: number, height: number) => {
    const dims = computeDimensions({ width, height }, scaleFactor);
    console.log("Resizing to: ", dims);
    renderer.setSize(dims.width, dims.height);
    camera.aspect = dims.width / dims.height;
    camera.updateProjectionMatrix();
  }

  // initialize size and camera aspect
  useEffect(() => {
    const dims = fetchContainerDimensions();
    doResize(dims.width, dims.height);
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0].target.id !== containerId) {
        return;
      }
      const dims = {
        width: entries[0].contentRect.width,
        height: entries[0].contentRect.height,
      }
      console.log("Detected resize!");
      doResize(dims.width, dims.height);
      renderScene();
    });

    const container = fetchContainer(containerId);

    observer.observe(container);

    return () => {
      observer.unobserve(container);
    }
  });


  useEffect(() => {
    const container = fetchContainer(containerId);
    while (container.firstChild) {
      container.firstChild.remove();
    }
    container.appendChild(renderer.domElement);
  }, []);

  useEffect(renderScene, []);

  return {
    renderer,
    camera,
    rootScene,
    renderScene
  }
}

function computeDimensions(base?: BoxDimensions, scale: number = 1): BoxDimensions {
  const width = base?.width ?? window.innerWidth;
  const height = base?.height ?? window.innerHeight;
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
