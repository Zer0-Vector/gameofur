import React, { useContext, useState } from "react"
import Board from './Board'
import PlayerArea from './PlayerArea'
import { GameState, GameController } from "../model/GameContext"
import './Game.css'
import SpaceData from "../model/SpaceData"
import TurnPhase from "../constants/TurnPhase"
import RacePath from "../constants/RacePath"

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
      var selectedId = null
      state.pieces.forEach((piece, id, map) => {
        piece.selected = !piece.selected && (id === pieceId)
        isSelected = isSelected || piece.selected
        map.set(id, piece)
        if (piece.selected) {
          selectedId = id
        }
      })
      setState({ 
        ...state, 
        selectedId: selectedId, 
        turnPhase: isSelected ? TurnPhase.SELECTED : TurnPhase.PRESELECT
      })
    },
    rollValue: function() {
      return state.diceFaces.map(v => v % 2).reduce((p, c) => p + c)
    },
    getSelectedPiece() {
      if (state.selectedId) {
        return state.pieces.get(state.selectedId)
      } else {
        return null
      }
    },
    getCurrentPathIndex() {
      const selectedPiece = this.getSelectedPiece()
      const spaceData = state.spaces.get(selectedPiece.locationId)
      return RacePath.get(state.currentPlayerId).indexOf(spaceData.id)
    },
    doMove(targetSpaceData, pieceData) {
      if (targetSpaceData.occupantId) {
        const currentOccupantData = state.pieces.get(targetSpaceData.occupantId)
        currentOccupantData.locationId = currentOccupantData.player.number === 1 ? SpaceData.P1_START_ID : SpaceData.P2_START_ID
        state.pieces.set(currentOccupantData.id, currentOccupantData)
      }
      if (pieceData.locationId >= 0) {
        state.spaces.set(pieceData.locationId, state.spaces.get(pieceData.locationId).withOccupantId(null))
      }
      state.spaces.set(targetSpaceData.id, targetSpaceData.withOccupantId(pieceData.id))
      pieceData.locationId = targetSpaceData.id
      state.pieces.set(pieceData.id, pieceData)
    },
    movePiece: function(destSpaceId) {
      if (!this.isLegalMove(destSpaceId)) {
        console.log("Illegal move!!! wtf?!")
        return
      }
      var selected = this.getSelectedPiece()
      console.log("Selected to move: ", selected)
      const currentSpace = state.spaces.get(selected.locationId)
      console.log("In space: ", currentSpace)
      const selectedPathIndex = this.getCurrentPathIndex()

      const nextSpaceId = RacePath.get(state.currentPlayerId)[selectedPathIndex + this.rollValue()]
      if (!selected || nextSpaceId !== destSpaceId) {
        return
      }
      console.log("Moving piece", selected.id, " to space", destSpaceId)
      this.selectPiece(null)
      setState({ ...state, turnPhase: TurnPhase.MOVING })

      const targetSpaceData = state.spaces.get(destSpaceId)
      this.doMove(targetSpaceData, selected)
      
      const advance = targetSpaceData.imageName === 'rosette' ? 0 : 1;
      var nextPlayer = (state.currentPlayerId + advance) % 2
      nextPlayer = nextPlayer % 2 === 0 ? 2 : 1
      setState({
        ...state,
        currentPlayerId: nextPlayer,
        turnPhase: TurnPhase.PREROLL,
        diceFaces: [0,0,0,0],
        selectedId: null,
      })
    },
    rollDice: async function() {
      setState({...state, turnPhase: TurnPhase.ROLLING})
      const maxFlips = Math.round(Math.random() * 7) + 5
      const roll = new Promise(resolve => {
        function flip(count) {
          if (count > maxFlips) {
            resolve([
              Math.floor(Math.random() * 4),
              Math.floor(Math.random() * 4),
              Math.floor(Math.random() * 4),
              Math.floor(Math.random() * 4),
            ])
            return
          } else {
            setTimeout(() => {
              setState({
                ...state,
                turnPhase: TurnPhase.ROLLING,
                diceFaces: [
                  Math.floor(Math.random() * 4),
                  Math.floor(Math.random() * 4),
                  Math.floor(Math.random() * 4),
                  Math.floor(Math.random() * 4),
                ]
              })
              flip(count + 1)
            }, 150)
          }
        }
        flip(0)
      })
      await roll.then(value => {
        // if rolled zero, pause for 1.5s to show roll. Then switch turns
        if (value.map(v => v % 2).reduce((p,c) => p + c) === 0) {
          console.log("ROLLED ZERO!")
          setState({
            ...state,
            dieFaces: value,
            turnPhase: TurnPhase.ROLLED_ZERO,
          })
          setTimeout(() => {
            setState({
              ...state,
              dieFaces: value,
              turnPhase: TurnPhase.PREROLL,
              currentPlayerId: state.currentPlayerId === 1 ? 2 : 1
            })
          }, 1500)
        } else {
          setState({
            ...state, 
            diceFaces: value, 
            turnPhase: TurnPhase.PRESELECT
          })
        }
      })
    },
    isLegalMove: function(targetSpaceId) {
      const rollValue = this.rollValue()
      const selected = this.getSelectedPiece()
      if (!selected) {
        return false
      }
      
      // you can't occupy the same space as another one of your pieces
      const targetSpaceData = state.spaces.get(targetSpaceId)
      const targetOccupantId = targetSpaceData.occupantId
      if (targetOccupantId) {
        const targetOccupantOwnerId = state.pieces.get(targetOccupantId).player.number
        if (targetOccupantOwnerId === state.currentPlayerId) {
          return false
        } else if (targetSpaceData.imageName === 'rosette') {
          return false
        }
      }

      const path = RacePath.get(state.currentPlayerId)
      const currentSpaceIndex = path.indexOf(selected.locationId)
      const nextSpaceId = path[currentSpaceIndex + rollValue]
      return nextSpaceId === targetSpaceId
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
