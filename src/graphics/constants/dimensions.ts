// constants for board dimensions
const board = (() => {
  const spaces = {
    width: 10,
    height: 10,
    thickness: 1,
    gap: 0.5,
  }
  const border = {
    width: 1,
    height: 1,
  }
  return {
    width: spaces.width * 3 + spaces.gap * 4 + border.width * 2,
    height: spaces.height * 8 + spaces.gap * 9 + border.height * 2,
    thickness: 1,
    bevelSize: 0.25,
    border: {
      width: border.width,
      height: border.height,
    },
    spaces: spaces,
  }
})();

// constants for space dimensions
const space = {
  width: 0.9,
  height: 0.1,
  depth: 0.9,
  // Animation offsets
  highlightOffset: 0.2,
  // Animation durations
  highlightDuration: 200,
  unhighlightDuration: 200,
  // Material properties
  material: {
    roughness: 0.6,
    metalness: 0.2,
  },
}

// constants for piece dimensions
const piece = {
  radiusTop: 0.4,
  radiusBottom: 0.4,
  height: 0.3,
  radialSegments: 16,
  // Animation parameters
  selectScale: 1.2,
  deselectScale: 1,
  selectDuration: 200,
  deselectDuration: 200,
  knockoutDuration: 400,
  knockoutScale: 0.1,
  spawnDuration: 300,
  spawnStartScale: 0.1,
  moveDuration: 800,
  moveArcHeight: 3,
  // Material properties
  material: {
    roughness: 0.4,
    metalness: 0.6,
  },
}

// constants for die dimensions
const die = {
  size: 0.5, // Tetrahedron radius
  // Animation parameters
  rollDuration: 500,
  rollRotations: 3,
  bounceAmplitude: 0.1,
  bounceMultiplier: 2,
  // Rotation axis multipliers for varied spinning
  rotationMultipliers: {
    x: 1,
    y: 0.7,
    z: 0.5,
  },
  // Material properties
  material: {
    roughness: 0.3,
    metalness: 0.7,
  },
}

export {
  board,
  space,
  piece,
  die,
}
