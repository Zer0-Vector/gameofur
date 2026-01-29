import type { Piece, Space, Die } from "@/objects";
import type { EmptyObject } from "@/types";
import type { DiceValues, PieceId, PlayerId, SpaceId } from "@/types/game";


/**
 * Events emitted by the GameModel.
 */

export type GameModelEvents = {
  'piece:created': { piece: Piece; };
  'piece:moved': { id: PieceId; from: SpaceId; to: SpaceId; };
  'piece:selected': { id: PieceId; };
  'piece:deselected': { id: PieceId; };
  'piece:knocked-out': { id: PieceId; };
  'piece:finished': { id: PieceId; };

  'space:created': { space: Space; };
  'space:occupied': { id: SpaceId; piece: PieceId; };
  'space:vacated': { id: SpaceId; };
  'space:highlighted': { id: SpaceId; };
  'space:unhighlighted': { id: SpaceId; };

  'dice:created': { die: Die; };
  'dice:rolled': { diceValues: DiceValues; total: number; };

  'player:changed': { player: PlayerId; };
  'game:started': EmptyObject;
  'game:reset': EmptyObject;
};
