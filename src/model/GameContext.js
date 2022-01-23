import React from "react"

const GameContext = React.createContext({
  players: [], // PlayerData[]
  pieces: [], // PieceData[]
  spaces: [], // SpaceData[]
})

export default GameContext
