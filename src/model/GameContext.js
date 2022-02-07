import React from "react"

export const GameState = React.createContext({
  players: new Map(), // Map<id, PlayerData>
  pieces: new Map(), // Map<id, PieceData>
  spaces: new Map(), // Map<id, SpaceData>
  gamePhase: null, // GamePhase
  turnPhase: null, // TurnPhase
  currentPlayerId: 1, // always 1 or 2; Use turnPhase
  diceFaces: [],
})

export const GameController = React.createContext({
  selectPiece: (pieceId)=>{},
  movePiece: (destSpaceId)=>{},
  rollDice: () => {},
})

