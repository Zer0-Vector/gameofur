import { EventEmitter } from './EventEmitter';
import { Piece, Space, Die } from '../objects';

/**
 * Events emitted by the GameModel.
 */
export interface GameModelEvents {
  'piece:created': { piece: Piece };
  'piece:moved': { pieceId: string; fromPosition: string | null; toPosition: string | null };
  'piece:selected': { pieceId: string };
  'piece:deselected': { pieceId: string };
  'piece:knocked-out': { pieceId: string };
  'piece:finished': { pieceId: string };

  'space:created': { space: Space };
  'space:occupied': { spaceId: string; pieceId: string };
  'space:vacated': { spaceId: string };
  'space:highlighted': { spaceId: string };
  'space:unhighlighted': { spaceId: string };

  'dice:created': { die: Die };
  'dice:rolled': { diceValues: number[]; total: number };

  'player:changed': { player: 'A' | 'B' };
  'game:started': Record<string, never>;
  'game:reset': Record<string, never>;
}

/**
 * GameModel - Pure observable data for the game.
 * Contains no logic, only state and change notifications.
 */
export class GameModel extends EventEmitter<GameModelEvents> {
  // Game objects - read-only references
  private readonly _pieces: Map<string, Piece>;
  private readonly _spaces: Map<string, Space>;
  private readonly _dice: Die[];

  // Game state
  private _currentPlayer: 'A' | 'B';
  private _selectedPieceId: string | null;

  constructor() {
    super();
    this._pieces = new Map();
    this._spaces = new Map();
    this._dice = [];
    this._currentPlayer = 'A';
    this._selectedPieceId = null;
  }

  // Read-only accessors
  get pieces(): ReadonlyMap<string, Piece> {
    return this._pieces;
  }

  get spaces(): ReadonlyMap<string, Space> {
    return this._spaces;
  }

  get dice(): readonly Die[] {
    return this._dice;
  }

  get currentPlayer(): 'A' | 'B' {
    return this._currentPlayer;
  }

  get selectedPieceId(): string | null {
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

  movePiece(pieceId: string, fromPosition: string | null, toPosition: string | null): void {
    this.emit('piece:moved', { pieceId, fromPosition, toPosition });
  }

  selectPiece(pieceId: string): void {
    this._selectedPieceId = pieceId;
    this.emit('piece:selected', { pieceId });
  }

  deselectPiece(pieceId: string): void {
    if (this._selectedPieceId === pieceId) {
      this._selectedPieceId = null;
    }
    this.emit('piece:deselected', { pieceId });
  }

  knockOutPiece(pieceId: string): void {
    this.emit('piece:knocked-out', { pieceId });
  }

  finishPiece(pieceId: string): void {
    this.emit('piece:finished', { pieceId });
  }

  occupySpace(spaceId: string, pieceId: string): void {
    this.emit('space:occupied', { spaceId, pieceId });
  }

  vacateSpace(spaceId: string): void {
    this.emit('space:vacated', { spaceId });
  }

  highlightSpace(spaceId: string): void {
    this.emit('space:highlighted', { spaceId });
  }

  unhighlightSpace(spaceId: string): void {
    this.emit('space:unhighlighted', { spaceId });
  }

  rollDice(diceValues: number[], total: number): void {
    this.emit('dice:rolled', { diceValues, total });
  }

  setCurrentPlayer(player: 'A' | 'B'): void {
    this._currentPlayer = player;
    this.emit('player:changed', { player });
  }

  startGame(): void {
    this._currentPlayer = 'A';
    this._selectedPieceId = null;
    this.emit('game:started', {});
  }

  resetGame(): void {
    this._selectedPieceId = null;
    this._currentPlayer = 'A';
    this.emit('game:reset', {});
  }

  /**
   * Get a piece by ID.
   */
  getPiece(id: string): Piece | undefined {
    return this._pieces.get(id);
  }

  /**
   * Get a space by ID.
   */
  getSpace(id: string): Space | undefined {
    return this._spaces.get(id);
  }

  /**
   * Get a die by index.
   */
  getDie(index: number): Die | undefined {
    return this._dice[index];
  }
}
