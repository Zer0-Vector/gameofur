import React from "react"
import RacePath, { PlayerId } from "../constants/RacePath"
import TurnPhase from "../constants/TurnPhase"
import { DiceFaces, DieFace, GameStateData } from "./GameState"
import PieceData from "./PieceData"
import SpaceData from "./SpaceData"

export class GameControllerImpl {
  state: GameStateData
  setState: (state:GameStateData)=>void

  constructor(state?: GameStateData, setState?: (state:GameStateData)=>void) {
    this.state = state || new GameStateData()
    this.setState = setState || ((_state:GameStateData) => {})
  }

  selectPiece(pieceId: number | null): void {
    var isSelected = false
    var selectedId = null
    this.state.pieces.forEach((piece: PieceData, id: number, map: Map<number, PieceData>) => {
      piece.selected = !piece.selected && (id === pieceId)
      isSelected = isSelected || piece.selected
      map.set(id, piece)
      if (piece.selected) {
        selectedId = id
      }
    })
    this.setState(this.state
      .withSelectedId(selectedId)
      .withTurnPhase(isSelected ? TurnPhase.SELECTED : TurnPhase.PRESELECT)
    )
  }
  rollValue(): number {
    return this.state.diceFaces.map(v => v % 2).reduce((p, c) => p + c)
  }
  getSelectedPiece(): PieceData|null {
    if (this.state.selectedId) {
      return this.state.pieces.get(this.state.selectedId) || null
    } else {
      return null
    }
  }
  getCurrentPathIndex(): number {
    const selectedPiece: PieceData|null = this.getSelectedPiece()
    if (!selectedPiece) {
      return -1
    }
    const spaceData: SpaceData|{id:-100} = this.state.spaces.get(selectedPiece.locationId) || {id:-100}
    return RacePath.get(this.state.currentPlayerId)?.indexOf(spaceData.id) || -1
  }
  doMove(targetSpaceData:SpaceData, pieceData:PieceData) {
    if (targetSpaceData.occupantId) {
      const currentOccupantData: PieceData|undefined = this.state.pieces.get(targetSpaceData.occupantId)
      if (!currentOccupantData) {
        // TODO log something
        return
      }
      currentOccupantData.locationId = currentOccupantData.player.number === 1 ? SpaceData.P1_START_ID : SpaceData.P2_START_ID
      this.state.pieces.set(currentOccupantData.id, currentOccupantData)
    }
    if (pieceData.locationId >= 0) {
      const newLocation = this.state.spaces.get(pieceData.locationId)
      if (!newLocation) {
        // TODO log something
        return
      }
      this.state.spaces.set(pieceData.locationId, newLocation.withOccupantId(null))
    }
    this.state.spaces.set(targetSpaceData.id, targetSpaceData.withOccupantId(pieceData.id))
    pieceData.locationId = targetSpaceData.id
    this.state.pieces.set(pieceData.id, pieceData)
  }
  movePiece(destSpaceId: number) {
    if (!this.isLegalMove(destSpaceId)) {
      console.log("Illegal move!!! wtf?!")
      return
    }
    var selected = this.getSelectedPiece()
    if (!selected) {
      throw new Error("No piece selected. Cannot move anything.")
    }
    console.log("Selected to move: ", selected)
    const currentSpace = this.state.spaces.get(selected.locationId)
    console.log("In space: ", currentSpace)
    const selectedPathIndex = this.getCurrentPathIndex()

    const currentPath = RacePath.get(this.state.currentPlayerId)
    if (!currentPath) {
      throw new Error("Current player missing path: "+this.state.currentPlayerId)
    }
    const nextSpaceId: number = currentPath[selectedPathIndex + this.rollValue()]
    
    if (!selected || nextSpaceId !== destSpaceId) {
      return
    }
    console.log("Moving piece", selected.id, " to space", destSpaceId)
    this.selectPiece(null)
    this.setState(this.state.withTurnPhase(TurnPhase.MOVING))

    const targetSpaceData = this.state.spaces.get(destSpaceId)
    if (!targetSpaceData) {
      throw new Error("Could not find target space: "+ destSpaceId)
    }
    this.doMove(targetSpaceData, selected)
    
    const advance = targetSpaceData.imageName === 'rosette' ? 0 : 1;
    var nextPlayer = (this.state.currentPlayerId + advance) % 2
    nextPlayer = nextPlayer % 2 === 0 ? 2 : 1
    this.setState(this.state
      .withCurrentPlayerId(nextPlayer as PlayerId)
      .withTurnPhase(TurnPhase.PREROLL)
      .withDiceFaces([0,0,0,0])
      .withSelectedId(null)
    )
  }
  hasNoLegalMoves() {
    // TODO iterate through pieces, checking if there are legal moves
    return false
  }
  async rollDice() {
    this.setState(this.state.withTurnPhase(TurnPhase.ROLLING))
    const maxFlips = Math.round(Math.random() * 7) + 5
    const thiz = this
    const roll = new Promise<DiceFaces>(resolve => {
      function flip(count: number) {
        if (count > maxFlips) {
          resolve([
            Math.floor(Math.random() * 4) as DieFace,
            Math.floor(Math.random() * 4) as DieFace,
            Math.floor(Math.random() * 4) as DieFace,
            Math.floor(Math.random() * 4) as DieFace,
          ])
          return
        } else {
          setTimeout(() => {
            thiz.setState(thiz.state
              .withTurnPhase(TurnPhase.ROLLING)
              .withDiceFaces([
                Math.floor(Math.random() * 4) as DieFace,
                Math.floor(Math.random() * 4) as DieFace,
                Math.floor(Math.random() * 4) as DieFace,
                Math.floor(Math.random() * 4) as DieFace,
              ])
            )
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
        thiz.setState(thiz.state
          .withDiceFaces(value)
          .withTurnPhase(TurnPhase.ROLLED_ZERO)
        )
        setTimeout(() => {
          thiz.setState(thiz.state
            .withDiceFaces(value)
            .withTurnPhase(TurnPhase.PREROLL)
            .withCurrentPlayerId(thiz.state.currentPlayerId === 1 ? 2 : 1)
          )
        }, 1500)
      } else if (this.hasNoLegalMoves()) {
        setTimeout(() => {
          thiz.setState(thiz.state
            .withDiceFaces(value)
            .withTurnPhase(TurnPhase.PREROLL)
            .withCurrentPlayerId(thiz.state.currentPlayerId === 1 ? 2 : 1)
          )
        }, 1500)
      } else {
        thiz.setState(thiz.state
          .withDiceFaces(value) 
          .withTurnPhase(TurnPhase.PRESELECT)
        )
      }
    })
  }
  isLegalMove(targetSpaceId: number): boolean {
    const rollValue = this.rollValue()
    const selected = this.getSelectedPiece()
    if (!selected) {
      return false
    }
    
    // you can't occupy the same space as another one of your pieces
    const targetSpaceData = this.state.spaces.get(targetSpaceId)
    const targetOccupantId = targetSpaceData?.occupantId
    if (targetOccupantId) {
      const targetOccupantOwnerId = this.state.pieces.get(targetOccupantId)?.player.number
      if (targetOccupantOwnerId === this.state.currentPlayerId) {
        return false
      } else if (targetSpaceData.imageName === 'rosette') {
        return false
      }
    }

    const path = RacePath.get(this.state.currentPlayerId)
    if (!path) {
      throw new Error("Could not find current path: " + this.state.currentPlayerId)
    }
    const currentSpaceIndex = path.indexOf(selected.locationId)
    const nextSpaceId = path[currentSpaceIndex + rollValue]
    return nextSpaceId === targetSpaceId
  }
}

const GameController = React.createContext(new GameControllerImpl())

export default GameController

