import React, { useContext, useState } from "react"
import Board from './Board'
import PlayerArea from './PlayerArea'
import { GameState, GameController } from "../model/GameContext"
import './Game.css'
import SpaceData from "../model/SpaceData"
import TurnPhase from "../constants/TurnPhase"

export default function Game() {

  const [state, setState] = useState(useContext(GameState))

  function piecesForPlayer(id) {
    const playerPieces = []
    state.pieces.forEach(val => {
      if (val.player.number === id) {
        playerPieces.push(val)
      }
    })
    return playerPieces
  }

  const controller = {
    selectPiece: function(pieceId) {
      var isSelected = false
      state.pieces.forEach((piece, id, map) => {
        piece.selected = !piece.selected && (id === pieceId)
        isSelected = isSelected || piece.selected
        map.set(id, piece)
      })
      setState({ ...state, turnPhase: isSelected ? TurnPhase.SELECTED : TurnPhase.PRESELECT })
    },
    movePiece: function(destSpaceId) {
      // TODO
      var selected = null
      state.pieces.forEach((piece) => {
        if (piece.selected) {
          selected = piece
        }
      })
      if (!selected) {
        return
      }
      console.log("Moving piece", selected.id, " to space", destSpaceId)
      this.selectPiece(null)
      setState({ ...state, turnPhase: TurnPhase.MOVING })
      const space = state.spaces.get(destSpaceId)
      if (selected.locationId >= 0) {
        state.spaces.set(selected.locationId, {...state.spaces.get(selected.locationId), occupantId: null})
      }
      state.spaces.set(destSpaceId, {...space, occupantId: selected.id})
      selected.locationId = destSpaceId
      state.pieces.set(selected.id, selected)
      setState({...state, turnPhase: TurnPhase.PREROLL})
    },
    rollDice: async function() {
      setState({...state, turnPhase: TurnPhase.ROLLING})
      await new Promise((resolve) => {
        const maxFlips = Math.round(Math.random() * 7) + 5
        for (var i = 0; i < maxFlips; i++) {
          setState({
            ...state,
            diceFaces: [
              Math.floor(Math.random() * 4),
              Math.floor(Math.random() * 4),
              Math.floor(Math.random() * 4),
              Math.floor(Math.random() * 4),
            ]
          })
        }
        resolve([
          Math.floor(Math.random() * 4),
          Math.floor(Math.random() * 4),
          Math.floor(Math.random() * 4),
          Math.floor(Math.random() * 4),
        ])
      }).then(value => setState({...state, diceFaces: value, turnPhase: TurnPhase.PRESELECT}))
    }
  }

  const player1 = state.players.get(1)
  const player2 = state.players.get(2)
  
  console.log("GamePhase: ", state.gamePhase)
  console.log("TurnPhase: ", state.turnPhase)
  return (
    <GameController.Provider value={controller}>
      <GameState.Provider value={state}>
        <div className="game">
            <div className="player-area-container">
              <PlayerArea 
                player={player1}
                pieces={piecesForPlayer(1)}
                startData={state.spaces.get(SpaceData.getId(player1.colId, SpaceData.START_ROW))}
                finishData={state.spaces.get(SpaceData.getId(player1.colId, SpaceData.FINISH_ROW))}
              />
            </div>
            <Board spaces={state.spaces} />
            <div className="player-area-container">
              <PlayerArea 
                player={state.players.get(2)}
                pieces={piecesForPlayer(2)}
                startData={state.spaces.get(SpaceData.getId(player2.colId, SpaceData.START_ROW))}
                finishData={state.spaces.get(SpaceData.getId(player2.colId, SpaceData.FINISH_ROW))}
              />
            </div>
        </div>
      </GameState.Provider>
    </GameController.Provider>
  )
}
