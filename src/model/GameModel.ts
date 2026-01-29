import { EventEmitter } from './EventEmitter';
import { Piece, Space, Die } from '../objects';
import type { GameModelEvents } from './Events';
import type { Maybe } from '@/types';
import type { DiceValues, PieceId, PlayerId, SpaceId } from '@/types/game';

export type GameStatus = "not-started" | "in-progress" | "ended";


/**
 * GameModel - Pure observable data for the game.
 * Contains no logic, only state and change notifications.
 */
export class GameModel extends EventEmitter<GameModelEvents> {
  public gameStatus: GameStatus;

  // Game objects - read-only references
  private readonly _pieces: Map<PieceId, Piece>;
  private readonly _spaces: Map<SpaceId, Space>;
  private readonly _dice: Die[];

  // Game state
  private _currentPlayer: PlayerId;
  private _selectedPieceId: Maybe<PieceId>;

  constructor() {
    super();
    this._pieces = new Map();
    this._spaces = new Map();
    this._dice = [];
    this._currentPlayer = "A";
    this._selectedPieceId = undefined;
    this.gameStatus = "not-started";
  }



  // Read-only accessors
  get pieces(): ReadonlyMap<PieceId, Piece> {
    return this._pieces;
  }

  get spaces(): ReadonlyMap<SpaceId, Space> {
    return this._spaces;
  }

  get dice(): readonly Die[] {
    return this._dice;
  }

  get diceTotal(): number {
    return this._dice.reduce((sum, die) => sum + die.value, 0);
  }

  get currentPlayer(): PlayerId {
    return this._currentPlayer;
  }

  get selectedPieceId(): Maybe<PieceId> {
    return this._selectedPieceId;
  }

  // Mutators - these emit events when data changes

  addPiece(piece: Piece): void {
    this._pieces.set(piece.id, piece);
    this.emit('piece:created', { piece });
  }

  addSpace(space: Space): void {
    this._spaces.set(space.id, space);
    this.emit('space:created', { space });
  }

  addDie(die: Die): void {
    this._dice.push(die);
    this.emit('dice:created', { die });
  }

  movePiece(id: PieceId, from: SpaceId, to: SpaceId): void {
    this.emit('piece:moved', { id, from, to });
  }

  getPieceAt(spaceId: SpaceId): Maybe<Piece> {
    return this._spaces.get(spaceId)?.occupant
  }

  getPiecesFor(player: PlayerId): Piece[] {
    return Array.from(this._pieces.values())
      .filter(piece => piece.owner === player);
  }

  selectPiece(pieceId: PieceId): void {
    this._selectedPieceId = pieceId;
    this.emit('piece:selected', { id: pieceId });
  }

  deselectPiece(id: PieceId): void {
    if (this._selectedPieceId === id) {
      this._selectedPieceId = undefined;
    }
    this.emit('piece:deselected', { id });
  }

  knockOutPiece(id: PieceId): void {
    this.emit('piece:knocked-out', { id });
  }

  finishPiece(id: PieceId): void {
    this.emit('piece:finished', { id });
  }

  occupySpace(id: SpaceId, piece: PieceId): void {
    this.emit('space:occupied', { id, piece });
  }

  vacateSpace(id: SpaceId): void {
    this.emit('space:vacated', { id });
  }

  highlightSpace(id: SpaceId): void {
    this.emit('space:highlighted', { id });
  }

  unhighlightSpace(id: SpaceId): void {
    this.emit('space:unhighlighted', { id });
  }

  rollDice(diceValues: DiceValues, total: number): void {
    this.emit('dice:rolled', { diceValues, total });
  }

  setCurrentPlayer(player: PlayerId): void {
    if (this._currentPlayer === player) {
      return;
    }

    this._currentPlayer = player;
    this.emit('player:changed', { player });
  }

  startGame(): void {
    this.initializeGameState();
    this.gameStatus = "in-progress";
    this.emit('game:started', {});
  }

  resetGame(): void {
    this.initializeGameState();
    this.gameStatus = "not-started";
    this.emit('game:reset', {});
  }

  private initializeGameState(): void {
    this.clearSelectedPiece();
    this._currentPlayer = "A";
  }

  /**
   * Get a piece by ID.
   */
  getPiece(id: PieceId): Piece | undefined {
    return this._pieces.get(id);
  }

  /**
   * Get a space by ID.
   */
  getSpace(id: SpaceId): Space | undefined {
    return this._spaces.get(id);
  }

  /**
   * Get a die by index.
   */
  getDie(index: number): Die | undefined {
    return this._dice[index];
  }

  dispose(): void {
    // nop
  }

  private clearSelectedPiece(): void {
    this._selectedPieceId = undefined;
  }
}
