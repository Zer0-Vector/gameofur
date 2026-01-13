import { Vector3 } from 'three';

// Initial positions for game objects
const initial = {
  // Default positions for new objects
  die: new Vector3(0, 0, 0),
  piece: new Vector3(0, 0, 0),
  table: new Vector3(0, 0, 0),
  board: new Vector3(0, 0, 0),
}

// Animation-related position constants
const animation = {
  // Emissive intensities
  emissive: {
    select: {
      intensity: 0.3,
    },
    highlight: {
      intensity: 0.3,
      pieceIntensity: 0.2,
    },
  },
  // Scale vectors
  scale: {
    normal: new Vector3(1, 1, 1),
    selected: new Vector3(1.2, 1.2, 1.2),
    knockoutStart: new Vector3(1, 1, 1),
    knockoutEnd: new Vector3(0.1, 0.1, 0.1),
    spawnStart: new Vector3(0.1, 0.1, 0.1),
    spawnEnd: new Vector3(1, 1, 1),
  },
  // Opacity values
  opacity: {
    visible: 1,
    invisible: 0,
  },
}

export {
  initial,
  animation,
}
