# Game of Ur - AI Coding Instructions

## Project Overview

This is a React + TypeScript implementation of the Royal Game of Ur using Three.js for 3D rendering, cannon-es for physics, and dat.gui for debugging. The project uses Vite as the build tool.

## Architecture

### Main Components

- **React + Three.js Integration**: Uses custom hooks pattern to encapsulate Three.js logic within React
  - `useGraphicsContainer()` - Manages WebGL renderer, camera, and scene setup with automatic resize handling
  - `useGame()` - Orchestrates the game, combining graphics, controls, and board
  - `useGameTable()` - Creates and manages the 3D game board geometry
  - `useControls()` - Sets up OrbitControls for camera manipulation

- **Entry Point**: [src/main.tsx](../src/main.tsx) → [src/App.tsx](../src/App.tsx) → [src/game.ts](../src/game.ts)

### Key Patterns

1. **Custom Hooks for Three.js**: All Three.js logic is wrapped in React hooks that initialize once via `useEffect` and clean up on unmount
2. **Functional Composition**: Three.js objects are created via factory functions (e.g., `createGameBoard()`, `configureLighting()`)
3. **Type Safety**: Uses `type` keyword for simple data structures (see [geometry-types.ts](../src/geometry-types.ts))

## Development Workflow

### Build & Run
```bash
npm run dev      # Start Vite dev server (background process)
npm run build    # TypeScript compile + Vite build
npm run preview  # Preview production build
```

### TypeScript Configuration
- **Strict Mode**: All strict TypeScript options enabled
- **Module System**: ES2022 with bundler resolution
- **No Emit**: TypeScript only for type checking; Vite handles transpilation
- **React JSX**: Uses `react-jsx` transform

## Code Conventions

### Styling Approach
- **CSS Custom Properties**: Uses `--target-height`, `--padding` for responsive sizing
- **Dynamic Units**: Prefers `dvh` (dynamic viewport height) over `vh` for mobile compatibility
- **Container Pattern**: `#game-container` is the Three.js canvas parent with flex centering
- Use double quotes wherever valid. Avoid single quotes if possible.

### Geometry Construction
- Board dimensions are constants with gaps, borders, and bevel sizes defined in [dimensions.ts](../src/graphics/constants/dimensions.ts)

## Game Logic (Not Fully Implemented)

### Board Structure
- 3x8 grid with cuts at positions [5,1], [6,1], [5,3], [6,3]
- Rosettes at: a1, b1, m4, a7, b7
- Two player paths converge in middle lane (m1-m8)
- Notation system documented in [NOTATION.md](../NOTATION.md)
- Space decorations in [assets/board-decor/*](../src/assets/board-decor/)
  - a4, a2, m7: [eyes0.svg](../src/assets/board-decor/eyes0.svg)
  - b4, b2: [eyes1.svg](../src/assets/board-decor/eyes1.svg)
  - a3, b3, m2, m5, m8: [bigfivedots.svg](../src/assets/board-decor/bigfivedots.svg)
  - m1: [twelvedots.svg](../src/assets/board-decor/twelvedots.svg)
  - m3, m6: [fourfivedots.svg](../src/assets/board-decor/fourfivedots.svg)
  - a8, b8: [smallfivedots.svg](../src/assets/board-decor/smallfivedots.svg)


### State Machine
- Game states defined in [states.plantuml](../states.plantuml)
- Flow: PreGame → InGame (StartTurn → DiceRolling → ComputeMoves → PreMove → PostMove → branching on space type)
- Special spaces: Rosettes (extra turn), Occupied (knockout), Finish (score check)

## Important Notes

- **Debug GUI**: dat.gui controls are automatically added in development for camera position/rotation
- **Container ID**: Hard-coded as `"game-container"` in multiple places
- **Future Plans**: See [goals.txt](../goals.txt) for multiplayer, AI, and variations roadmap

## When Making Changes

- Add new Three.js features via custom hooks following the `use*` pattern
- Update board dimensions in constants files in the [constants](../src/graphics/constants/) directory, not magic numbers
- Keep TypeScript strict - no `any` types
- Follow the functional factory pattern for Three.js object creation
- Test resize behavior - ResizeObserver handles canvas sizing automatically
