import type { GameModel } from '../model';
import { PieceGraphics, SpaceGraphics, DieGraphics, GraphicsRenderer } from '../graphics';
import type { GameAction } from '../controller/GameController';
import { Color, Vector3 } from 'three';
import type { Camera, Raycaster, Scene } from 'three';
import type { Piece } from '../objects';

/**
 * GameView - Handles all rendering and user input.
 * Subscribes to model changes and updates graphics accordingly.
 * Relays user interactions to the controller.
 */
export class GameView {
  private readonly graphicsRenderer: GraphicsRenderer;
  private readonly model: GameModel;
  private readonly onAction: (action: GameAction) => void;

  // Track graphics for cleanup
  private readonly pieceGraphics: Map<string, PieceGraphics>;
  private readonly spaceGraphics: Map<string, SpaceGraphics>;
  private readonly dieGraphics: Map<string, DieGraphics>;

  constructor(
    scene: Scene,
    model: GameModel,
    onAction: (action: GameAction) => void
  ) {
    this.model = model;
    this.onAction = onAction;
    this.graphicsRenderer = new GraphicsRenderer(scene);
    this.pieceGraphics = new Map();
    this.spaceGraphics = new Map();
    this.dieGraphics = new Map();

    this.subscribeToModel();
  }

  /**
   * Subscribe to all model events.
   */
  private subscribeToModel(): void {
    // Piece events
    this.model.on('piece:created', (data) => this.onPieceCreated(data));
    this.model.on('piece:moved', (data) => this.onPieceMoved(data));
    this.model.on('piece:selected', (data) => this.onPieceSelected(data));
    this.model.on('piece:deselected', (data) => this.onPieceDeselected(data));
    this.model.on('piece:knocked-out', (data) => this.onPieceKnockedOut(data));

    // Space events
    this.model.on('space:created', (data) => this.onSpaceCreated(data));
    this.model.on('space:highlighted', (data) => this.onSpaceHighlighted(data));
    this.model.on('space:unhighlighted', (data) => this.onSpaceUnhighlighted(data));

    // Dice events
    this.model.on('dice:created', (data) => this.onDieCreated(data));
    this.model.on('dice:rolled', (data) => this.onDiceRolled(data));

    // Game events
    this.model.on('game:reset', () => this.onGameReset());
    // TODO: this.model.on("game:started", () => this.onGameStarted());
  }

  // Event handlers - update graphics based on model changes

  private onPieceCreated(data: { piece: Piece }): void {
    const { piece } = data;
    const player = piece.player;

    // Calculate starting position based on player
    const startX = player === 'A' ? -15 : 15;
    const pieceIndex = Array.from(this.model.pieces.values()).filter(
      (p) => p.player === player
    ).length - 1;
    const startZ = pieceIndex * 2;

    const graphics = new PieceGraphics(player, pieceIndex, new Vector3(startX, 1, startZ));
    this.pieceGraphics.set(piece.id, graphics);
    this.graphicsRenderer.addObject(piece.id, graphics);
  }

  private async onPieceMoved(data: {
    pieceId: string;
    fromPosition: string | null;
    toPosition: string | null;
  }): Promise<void> {
    const { pieceId, toPosition } = data;

    if (toPosition === null) {
      // Moved back to start - implement later
      return;
    }

    // Find the space to move to
    const targetSpace = Array.from(this.model.spaces.values()).find(
      (s) => s.notation === toPosition
    );

    if (!targetSpace) return;

    // Get the space graphics to find position
    const spaceGraphics = this.graphicsRenderer.getObject(targetSpace.id);
    if (!spaceGraphics) return;

    const targetPos = spaceGraphics.object3D.position.clone();
    targetPos.y = 1; // Height above space

    await this.graphicsRenderer.animate(pieceId, 'move', { targetPosition: targetPos });
  }

  private onPieceSelected(data: { pieceId: string }): void {
    this.graphicsRenderer.animate(data.pieceId, 'select');
  }

  private onPieceDeselected(data: { pieceId: string }): void {
    this.graphicsRenderer.animate(data.pieceId, 'deselect');
  }

  private async onPieceKnockedOut(data: { pieceId: string }): Promise<void> {
    await this.graphicsRenderer.animate(data.pieceId, 'knockout');
    // TODO: Move piece back to start position
  }

  private onSpaceCreated(data: { space: any }): void {
    const { space } = data;
    const notation = space.notation as string;
    const isRosette = space.isRosette as boolean;

    // Calculate position based on notation
    const position = this.calculateSpacePosition(notation);
    const graphics = new SpaceGraphics(notation, isRosette ? new Color(0xffff00) : new Color(0x808080), position);

    this.spaceGraphics.set(space.id, graphics);
    this.graphicsRenderer.addObject(space.id, graphics);
  }

  private onSpaceHighlighted(data: { spaceId: string }): void {
    this.graphicsRenderer.animate(data.spaceId, 'highlight');
  }

  private onSpaceUnhighlighted(data: { spaceId: string }): void {
    this.graphicsRenderer.animate(data.spaceId, 'unhighlight');
  }

  private onDieCreated(data: { die: any }): void {
    const { die } = data;
    const dieIndex = this.model.dice.length - 1;
    const position = new Vector3(-5 + dieIndex * 2, 1, -10);

    const graphics = new DieGraphics(`die-${dieIndex}`, position);
    this.dieGraphics.set(die.id, graphics);
    this.graphicsRenderer.addObject(die.id, graphics);
  }

  private async onDiceRolled(_data: { diceValues: number[]; total: number }): Promise<void> {
    // Animate all dice
    const animations = this.model.dice.map((die) =>
      this.graphicsRenderer.animate(die.id, 'roll')
    );
    await Promise.all(animations);
  }

  private onGameReset(): void {
    // Reset visual state - pieces and spaces will handle their own reset
  }

  /**
   * Calculate 3D position for a space based on its notation.
   */
  private calculateSpacePosition(notation: string): Vector3 {
    // Parse notation (e.g., 'a1', 'm4', 'b7')
    const lane = notation[0]; // 'a', 'b', or 'm'
    const row = Number.parseInt(notation.substring(1), 10);

    let x = 0;
    if (lane === 'a') x = -10;
    else if (lane === 'b') x = 10;

    const z = (row - 1) * 5;

    return new Vector3(x, 0.5, z);
  }

  /**
   * Setup user interaction handlers.
   * This relays user input to the controller.
   */
  setupInteractions(_raycaster: Raycaster, _camera: Camera): void {
    // TODO: Implement click handlers using raycaster
    // This would detect clicks on pieces/spaces and call this.onAction()
  }

  /**
   * Trigger a user action (sends to controller).
   */
  triggerAction(action: GameAction): void {
    this.onAction(action);
  }

  /**
   * Update graphics (called each frame).
   */
  update(deltaTime: number): void {
    this.graphicsRenderer.updateAll(deltaTime);
  }

  /**
   * Cleanup resources.
   */
  dispose(): void {
    this.graphicsRenderer.dispose();
    this.model.clear();
    this.pieceGraphics.clear();
    this.spaceGraphics.clear();
    this.dieGraphics.clear();
  }
}
