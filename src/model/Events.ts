import type { Piece, Space, Die } from "@/objects";


/**
 * Events emitted by the GameModel.
 */

export type GameModelEvents = {
  'piece:created': { piece: Piece; };
  'piece:moved': { pieceId: string; fromPosition: string | null; toPosition: string | null; };
  'piece:selected': { pieceId: string; };
  'piece:deselected': { pieceId: string; };
  'piece:knocked-out': { pieceId: string; };
  'piece:finished': { pieceId: string; };

  'space:created': { space: Space; };
  'space:occupied': { spaceId: string; pieceId: string; };
  'space:vacated': { spaceId: string; };
  'space:highlighted': { spaceId: string; };
  'space:unhighlighted': { spaceId: string; };

  'dice:created': { die: Die; };
  'dice:rolled': { diceValues: number[]; total: number; };

  'player:changed': { player: 'A' | 'B'; };
  'game:started': Record<string, never>;
  'game:reset': Record<string, never>;
};
