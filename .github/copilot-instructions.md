# Game of Ur - AI Coding Instructions

## Project Overview

This is a React + TypeScript implementation of the Royal Game of Ur using Three.js for 3D rendering, cannon-es for physics, and dat.gui for debugging. The project uses Vite as the build tool.

## Architecture

- See [ARCHITECTURE.md](../ARCHITECTURE.md) for detailed architecture overview

## Development Workflow

- Use TDD


## Code Conventions

### Style
- **CSS Custom Properties**: Uses `--target-height`, `--padding` for responsive sizing
- **Dynamic Units**: Prefers `dvh` (dynamic viewport height) over `vh` for mobile compatibility
- **Container Pattern**: `#game-container` is the Three.js canvas parent with flex centering
- Use double quotes wherever valid. Avoid single quotes if possible.
- Prefer to create type definition instead of using unions or intersections directly.

### Geometry Construction
- Board dimensions are constants with gaps, borders, and bevel sizes defined in [dimensions.ts](../src/graphics/constants/dimensions.ts)

## When Making Changes

- Use TDD
- No magic numbers
