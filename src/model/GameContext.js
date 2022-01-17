import React from "react"
import Player from "./Player"

const GameContext = (() => {
    const p1 = new Player(1)
    const p2 = new Player(2)
    const players = [p1,p2]
    const pieceCount = 7;
    var pieces = new Array(pieceCount * players.length)
    for (var i = 0; i < players.length; i++) {
      for (var j = 0; j < pieceCount; j++) {
        pieces.push(new PieceData(i, j))
      }
    }

    return React.createContext(
      {
        players: players,
        pieces: pieces,
      }
    )
  }
)()

export default GameContext
