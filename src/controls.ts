import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from 'three';

export function useControls(camera: THREE.Camera, domElement: HTMLElement, render: () => void) {
  const orbit = new OrbitControls(camera, domElement);
  orbit.addEventListener('change', render);
  orbit.enablePan = true;
  orbit.enableZoom = true;
  orbit.enableRotate = true;
  orbit.autoRotate = true;
  orbit.autoRotateSpeed = 0.5;

  return {
    orbit
  }
}
