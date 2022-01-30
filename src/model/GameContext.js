import React from "react"

const GameContext = React.createContext({
  players: [], // PlayerData[]
  pieces: [], // PieceData[]
  spaces: [], // SpaceData[]
  selectedPiece: null,
})

export default GameContext
