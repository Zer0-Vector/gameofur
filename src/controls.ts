import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { Camera } from "three";

export function useControls(camera: Camera, domElement: HTMLElement, render: () => void) {
  const orbit = new OrbitControls(camera, domElement);
  orbit.addEventListener('change', render);
  orbit.enablePan = true;
  orbit.enableZoom = true;
  orbit.enableRotate = true;

  return {
    orbit
  }
}
