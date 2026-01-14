import type { GameModel, GameModelEvents } from '@/model';
import { PieceGraphics, SpaceGraphics, DieGraphics } from '@/graphics/objects';
import type { TableGraphics } from '@/graphics/objects';
import type { GameAction } from '@/controller';
import { Color, Vector3 } from 'three';
import type { Camera, Raycaster } from 'three';
import { dimensions } from '@/graphics/constants';

/**
 * GameView - Handles all rendering and user input.
 * Subscribes to model changes and updates graphics accordingly.
 * Relays user interactions to the controller.
 */
export class GameView {
  private readonly table: TableGraphics;
  private readonly model: GameModel;
  private readonly onAction: (action: GameAction) => void;

  constructor(
    table: TableGraphics,
    model: GameModel,
    onAction: (action: GameAction) => void
  ) {
    this.table = table;
    this.model = model;
    this.onAction = onAction;

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

  private onPieceCreated(data: GameModelEvents["piece:created"]): void {
    const { piece } = data;
    const player = piece.player;

    const pieceWidth = Math.max(dimensions.piece.radiusBottom, dimensions.piece.radiusTop) * 2;

    const distanceFromCenter = (dimensions.board.width / 2) + pieceWidth;
    const startX = player === 'A' ? -distanceFromCenter : distanceFromCenter;
    const pieceIndex = Array.from(this.model.pieces.values()).filter(
      (p) => p.player === player
    ).length - 1;
    const startZ = pieceIndex * (pieceWidth + 0.5) - ((pieceWidth + 0.5) * 5);

    const graphics = new PieceGraphics(player, pieceIndex, new Vector3(startX, 1, startZ));
    this.table.addPiece(graphics);
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
    const spaceGraphics = this.table.board.getSpace(targetSpace.id);
    if (!spaceGraphics) return;

    const targetPos = spaceGraphics.object3D.position.clone();
    targetPos.y = 1; // Height above space

    await this.table.animateObject(pieceId, 'move', { targetPosition: targetPos });
  }

  private onPieceSelected(data: GameModelEvents["piece:selected"]): void {
    this.table.animateObject(data.pieceId, 'select');
  }

  private onPieceDeselected(data: GameModelEvents["piece:deselected"]): void {
    this.table.animateObject(data.pieceId, 'deselect');
  }

  private async onPieceKnockedOut(data: GameModelEvents["piece:knocked-out"]): Promise<void> {
    await this.table.animateObject(data.pieceId, 'knockout');
    // TODO: Move piece back to start position
  }

  private onSpaceCreated(data: GameModelEvents["space:created"]): void {
    const { space } = data;
    const notation = space.notation;
    const isRosette = space.isRosette;

    // Calculate position based on notation
    const position = this.calculateSpacePosition(notation);
    const graphics = new SpaceGraphics(notation, isRosette ? new Color(0xffff00) : new Color(0x808080), position);

    this.table.board.addSpace(graphics);
  }

  private onSpaceHighlighted(data: GameModelEvents["space:highlighted"]): void {
    this.table.board.animateSpace(data.spaceId, 'highlight');
  }

  private onSpaceUnhighlighted(data: { spaceId: string }): void {
    this.table.board.animateSpace(data.spaceId, 'unhighlight');
  }

  private onDieCreated(data: GameModelEvents["dice:created"]): void {
    const dieIndex = this.model.dice.length - 1;
    const position = new Vector3(-5 + dieIndex * 2, 1, -10);

    const graphics = new DieGraphics(`die-${dieIndex}`, position);
    this.table.addDie(graphics);
  }

  private async onDiceRolled(_data: GameModelEvents["dice:rolled"]): Promise<void> {
    // Animate all dice
    const animations = this.model.dice.map((die) =>
      this.table.animateObject(die.id, 'roll')
    );
    await Promise.all(animations);
  }

  private onGameReset(): void {
    // Reset visual state - pieces and spaces will handle their own reset
  }

  /**
   * Calculate 3D position for a space based on its notation.
   * Returns position in board-relative coordinates (board is rotated Math.PI/2 around Y).
   */
  private calculateSpacePosition(notation: string): Vector3 {
    // Parse notation (e.g., 'a1', 'm4', 'b7')
    const lane = notation.startsWith("a") ? -1 : notation[0].startsWith("b") ? 1 : 0; // NOSONAR
    
    const row = Number.parseInt(notation.substring(1), 10);
    
    const trueWidth = dimensions.space.width + dimensions.space.gap;
    const trueDepth = dimensions.space.depth + dimensions.space.gap;

    const initialWorldX = -dimensions.board.inner.width / 2 - 2 * dimensions.space.width - dimensions.space.gap;
    const initialWorldZ = dimensions.space.depth + dimensions.space.gap;

    // Calculate position in world space first
    let worldX = initialWorldX + (row - 1) * trueWidth;
    let worldZ = initialWorldZ - (lane + 1) * trueDepth;
    

    // Board is rotated Math.PI/2 around Y, so convert to board-relative coords
    // World X becomes board Z, world Z becomes board -X
    const boardX = -worldZ;
    const boardZ = worldX;

    return new Vector3(boardX, dimensions.space.height* 2 / 3, boardZ);
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
    this.table.updateAll(deltaTime);
  }

  /**
   * Cleanup resources.
   */
  dispose(): void {
    // Table will be disposed by game.ts
    this.model.clear();
  }
}
