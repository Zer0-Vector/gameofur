import React, { useContext, useState } from "react"
import Board from './Board'
import PlayerArea from './PlayerArea'
import './Game.css'
import SpaceData from "../model/SpaceData"
import GameController, { GameControllerImpl } from "../model/GameController"
import GameState, { GameStateData } from "../model/GameState"
import PieceData from "../model/PieceData"

export default function Game() {

  const gameState: GameStateData = useContext<GameStateData>(GameState)
  const [state, setState] = useState(gameState)

  function piecesForPlayer(id: number) {
    const playerPieces: PieceData[] = []
    state.pieces.forEach(val => {
      if (val.player.number === id) {
        playerPieces.push(val)
      }
    })
    return playerPieces
  }

  const player1 = state.players.get(1)
  const player2 = state.players.get(2)

  if (!player1 || !player2) {
    throw new Error("Players not initialized properly")
  }
  
  console.log("GamePhase: ", state.gamePhase)
  console.log("TurnPhase: ", state.turnPhase)
  return (
    <GameController.Provider value={new GameControllerImpl(state, setState)}>
      <GameState.Provider value={state}>
        <div className="game">
            <div className="player-area-container">
              <PlayerArea 
                player={player1}
                pieces={piecesForPlayer(1)}
                startData={state.spaces.get(SpaceData.getId(player1.colId, SpaceData.START_ROW)) as SpaceData}
                finishData={state.spaces.get(SpaceData.getId(player1.colId, SpaceData.FINISH_ROW)) as SpaceData}
              />
            </div>
            <Board spaces={state.spaces} />
            <div className="player-area-container">
              <PlayerArea 
                player={player2}
                pieces={piecesForPlayer(2)}
                startData={state.spaces.get(SpaceData.getId(player2.colId, SpaceData.START_ROW)) as SpaceData}
                finishData={state.spaces.get(SpaceData.getId(player2.colId, SpaceData.FINISH_ROW)) as SpaceData}
              />
            </div>
        </div>
      </GameState.Provider>
    </GameController.Provider>
  )
}
