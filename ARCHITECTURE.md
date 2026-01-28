# Three.js Board Game Architecture Outline

[Claude chat (not public)](https://claude.ai/chat/c6a9942f-aaf7-4321-b4cc-e2ec815caac7)

## 1. Overview
- **Pattern**: Model-View-Presenter (MVP)
- **Technologies**: Three.js for 3D rendering, React for UI, Firebase for multiplayer
- **Key Principle**: Separation of concerns with event-driven communication during gameplay

## 2. Core Layers

### 2.1 Model Layer
**Purpose**: Game state and business logic, no rendering knowledge

**Components**:
- **GameModel**: Core game state
  - Board state (positions, tiles)
  - Pieces (type, position, owner)
  - Players (id, name, color, score)
  - Turn management (current player, turn count)
  - Game phase (setup, playing, ended)

- **RulesEngine**: Move validation and game rules
  - `isValidMove(piece, from, to): boolean`
  - `getValidMoves(piece): Position[]`
  - `checkWinCondition(): Player | null`
  - Separate from GameModel for testability and rule complexity

- **Events Emitted**:
  - `piece.moved`
  - `piece.captured`
  - `turn.changed`
  - `game.ended`
  - `player.joined`
  - `player.left`

**State Persistence**:
- `serialize()`: Convert state to JSON for Firebase sync
- `deserialize(data)`: Restore state from Firebase snapshot

**Testing**: Pure JavaScript classes, easily unit testable without rendering

### 2.2 View Layer

#### 2.2.1 Three.js View
**Purpose**: 3D rendering of game board and pieces

**Components**:
- **ThreeJSView**: Main 3D view controller
  - Scene, camera, renderer setup
  - Direct initialization methods (not events)
  - Responds to Model events during gameplay

- **AssetManager**: Centralized asset loading
  - `loadModel(path): Promise<Object3D>`
  - `loadTexture(path): Promise<Texture>`
  - Caching and preloading
  - Loading progress tracking

- **BoardRenderer**: Renders the game board
  - Builds board geometry from Model data
  - Tile highlighting for valid moves
  - Board decoration and styling

- **PieceRenderer**: Manages piece 3D objects
  - Creates pieces from Model data
  - Animation of moves (using Three.js AnimationMixer)
  - Piece removal on capture

- **InteractionHandler**: Raycasting and user input
  - Click detection on board/pieces
  - Hover effects
  - Touch support for mobile

- **CameraController**: Camera positioning
  - Orbital controls for rotation
  - Smooth transitions between views
  - Mobile-friendly controls (pinch, pan)

**View Configuration** (separate from Model):

```typescript
{
  tileSize: 1,
  pieceModels: { 'pawn': '/models/pawn.glb', ... },
  materials: { ... },
  lighting: { ... },
  cameraDefaults: { position, target }
}
```

#### 2.2.2 React View
**Purpose**: UI overlays, menus, and game screens

**State Management**:
- useReducer for complex UI state
- Direct updates from Presenter via setState callback
- Read-only view of game state

**Component Structure**:
- **App**: Root component with screen routing
- **MainMenu**: Game creation, join game
- **GameBoard**: Main game screen wrapper
  - **GameCanvas**: Three.js canvas mount point
  - **GameHUD**: Player info, turn indicator, timer
  - **MoveHistory**: List of moves
  - **GameControls**: Resign, draw offer, settings
- **GameOver**: End game screen with results
- **Settings**: Audio, graphics options
- **LoadingScreen**: Asset loading progress

**Screens/Routing**:
- Simple state-based screen switching (no React Router needed initially)
- Screens: 'menu', 'lobby', 'game', 'gameOver'

### 2.3 Presenter Layer
**Purpose**: Orchestrates Model and Views, handles user input

**Components**:
- **GamePresenter**: Main coordinator
  - **Initialization phase** (direct calls):

    ```typescript
    async init() {
      await threeView.buildBoard(model.board)
      await threeView.createPieces(model.pieces)
      startEventListeners()
    }
    ```

  - **Event listeners** (gameplay phase):
    - Subscribe to Model events
    - Update both Views when Model changes
    - Coordinate animations with state updates

  - **User input handling**:
    - `onBoardClick(position)`: Handle 3D board clicks
    - `onUIAction(action)`: Handle React button clicks
    - Validate with RulesEngine
    - Update Model if valid
    - Send moves to Firebase

  - **Error handling**:
    - Try/catch around critical operations
    - Emit error events for Views to display
    - Graceful degradation

**Communication Bridge**:
- Three.js → Presenter: Callbacks for raycasting hits
- React → Presenter: Event handlers passed as props
- Presenter → Views: Method calls and state updates
- Model → Presenter: Event subscriptions

## 3. Multiplayer Integration (Firebase)

### 3.1 Firebase Service
**Purpose**: Sync game state across clients

**Components**:
- **FirebaseManager**: Realtime Database interface
  - `createGame(gameId, initialState)`
  - `joinGame(gameId)`
  - `syncMove(gameId, moveData)`
  - `onGameStateChange(callback)`
  - Connection state monitoring

- **State Synchronization**:
  - Host creates game → writes initial state to Firebase
  - Players join → read state and subscribe to updates
  - Moves → write to Firebase → other clients react
  - Optimistic updates for move initiator

- **Conflict Resolution**:
  - Timestamp-based move ordering
  - Server validation (optional Firebase Functions)
  - Rollback on invalid moves

**Integration with Presenter**:

```typescript
class GamePresenter {
  constructor(model, views, firebaseManager) {
    // Local moves update Firebase
    model.on('piece.moved', (data) => {
      firebaseManager.syncMove(gameId, data)
      views.three.animateMove(data)
      views.react.updateState(...)
    })

    // Remote moves update Model
    firebaseManager.on('remote.move', (data) => {
      model.applyMove(data) // Updates Model, which emits events
    })
  }
}
```

### 3.2 Session Management
- URL-based game IDs for sharing
- Player authentication (Firebase Auth)
- Reconnection handling
- Player disconnect detection

## 4. Asset Management

### 4.1 AssetManager Implementation

```typescript
class AssetManager {
  constructor() {
    this.cache = new Map()
    this.loaders = {
      gltf: new GLTFLoader(),
      texture: new TextureLoader()
    }
  }

  async loadAll(manifest) {
    // Parallel loading with progress tracking
    // Returns Promise that resolves when all assets ready
  }

  get(key) {
    // Retrieve from cache
  }
}
```

### 4.2 Loading Strategy
- Show loading screen during initial asset load
- Preload all game assets on game start
- Progress bar in React LoadingScreen component
- Error handling for failed loads

## 5. Error Handling Strategy

### 5.1 Error Types
- **Initialization errors**: Asset loading failures, WebGL not supported
- **Runtime errors**: Invalid moves, Firebase connection loss, animation errors
- **Multiplayer errors**: Desync, opponent disconnect

### 5.2 Error Flow

```typescript
// Presenter catches errors
class GamePresenter {
  async onBoardClick(position) {
    try {
      const move = this.validateMove(position)
      await this.model.movePiece(move)
    } catch (error) {
      this.handleError(error)
    }
  }

  handleError(error) {
    // Log error
    // Show user-friendly message in React UI
    // Emit error event if needed
  }
}
```

### 5.3 Error Display
- Toast notifications in React for non-critical errors
- Modal dialogs for critical errors (connection lost, game corrupted)
- Fallback UI when WebGL unavailable

## 6. Mobile Support Considerations

### 6.1 Touch Interactions
- Touch events in InteractionHandler
- Gesture library for pinch-to-zoom
- Larger hit targets for pieces
- Visual feedback for selections

### 6.2 Performance
- Lower poly models for mobile
- Simplified materials/shadows
- Texture resolution adjustment
- FPS monitoring and dynamic quality adjustment

### 6.3 Responsive UI
- CSS media queries for React components
- Portrait vs landscape layouts
- Bottom sheet UI patterns for mobile

## 7. Testing Strategy

### 7.1 Model Layer Testing
- **Unit tests**: RulesEngine validation logic
- **State tests**: GameModel state transitions
- **Serialization tests**: Save/load integrity
- Pure JavaScript, easy to test in isolation

### 7.2 View Layer Testing
- **Three.js**: Manual testing, visual regression tests
- **React**: Component tests with React Testing Library
- **Integration**: Test Presenter → View communication

### 7.3 Presenter Layer Testing
- Mock Model and Views
- Test event flow and coordination
- Test error handling paths

### 7.4 E2E Testing
- Playwright/Cypress for full game flows
- Multiplayer scenarios with multiple browser instances

## 8. Future Considerations

### 8.1 AI Opponent (Separate Module)

```typescript
class AIPlayer {
  constructor(rulesEngine) {
    this.rulesEngine = rulesEngine
  }

  calculateMove(gameState) {
    // Minimax, Monte Carlo, etc.
    // Returns move data
  }
}

// Presenter integrates AI
class GamePresenter {
  onTurnChanged({ currentPlayer }) {
    if (currentPlayer.isAI) {
      const move = this.aiPlayer.calculateMove(this.model.state)
      this.onBoardClick(move.position)
    }
  }
}
```

### 8.2 Extensibility
- Plugin system for different game variants
- Custom board configurations
- Theme system for visual customization

## 9. Project Structure

```text
src/
├── model/
│   ├── GameModel.js
│   ├── RulesEngine.js
│   └── types.js
├── view/
│   ├── three/
│   │   ├── ThreeJSView.js
│   │   ├── AssetManager.js
│   │   ├── BoardRenderer.js
│   │   ├── PieceRenderer.js
│   │   ├── InteractionHandler.js
│   │   └── CameraController.js
│   └── react/
│       ├── App.jsx
│       ├── screens/
│       ├── components/
│       └── hooks/
├── presenter/
│   └── GamePresenter.js
├── services/
│   └── FirebaseManager.js
├── config/
│   ├── viewConfig.js
│   └── assetManifest.js
├── utils/
│   └── EventEmitter.js (browser-compatible)
└── index.js
```

## 10. Initialization Flow

```typescript
// index.js - Application entry point
async function initGame() {
  // 1. Initialize Model
  const model = new GameModel(initialConfig)
  const rulesEngine = new RulesEngine(model)

  // 2. Initialize Firebase
  const firebase = new FirebaseManager()
  await firebase.connect()

  // 3. Initialize Three.js View
  const canvas = document.getElementById('game-canvas')
  const assetManager = new AssetManager()
  const threeView = new ThreeJSView(canvas, assetManager)

  // Show loading screen
  reactRoot.render(<LoadingScreen />)

  // Load assets
  await assetManager.loadAll(ASSET_MANIFEST)

  // 4. Initialize React View
  const reactUpdater = (state) => {
    reactRoot.render(<GameBoard gameState={state} />)
  }

  // 5. Initialize Presenter (orchestrates everything)
  const presenter = new GamePresenter(
    model,
    rulesEngine,
    threeView,
    reactUpdater,
    firebase
  )

  // 6. Direct initialization calls
  await presenter.init()

  // 7. Start game (now events take over)
  presenter.startGame()
}

initGame().catch(handleFatalError)
```

---

# Future Features

- Firebase integration (GameModel already has serialization-ready structure)
- AssetManager (deferred until 3D models added)
- Move history tracking (Model ready, UI pending)
- AI opponent (can plug into Presenter action system)
