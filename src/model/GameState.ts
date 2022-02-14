import PlayerData from '../model/PlayerData'
import PieceData from '../model/PieceData'
import SpaceData from '../model/SpaceData'
import GamePhase from '../constants/GamePhase'
import TurnPhase from '../constants/TurnPhase'
import React from 'react'
import { PlayerId } from '~/constants/RacePath'

export type DieFace = 0 | 1 | 2 | 3
export type DiceFaces = [DieFace, DieFace, DieFace, DieFace]

export class GameStateData {
  static #getImage = (col: number, row: number): string => {
    switch (col) {
      case 0:
      case 2:
        switch (row) {
          case 0:
          case 6:
            return 'rosette'
          case 1:
            return 'eyes1'
          case 2:
            return 'bigfivedots'
          case 3:
            return 'eyes0'
          case 7:
            return 'smallfivedots'
          default:
            throw new Error("Invalid Row: " + row)
        }
      case 1:
        switch (row) {
          case 0:
            return 'twelvedots'
          case 1:
          case 4:
          case 7:
            return 'bigfivedots'
          case 2:
          case 5:
            return 'fourfivedots'
          case 3:
            return 'rosette'
          case 6:
            return 'eyes0'
          default:
            throw new Error("Invalid row: " + row)
        }
      default:
        throw new Error("Invalid column: " + col)
    }
  }

  players: Map<number, PlayerData>
  pieces: Map<number, PieceData>
  spaces: Map<number, SpaceData>
  gamePhase: GamePhase
  turnPhase: TurnPhase
  currentPlayerId: PlayerId
  diceFaces: DiceFaces
  selectedId: number | null

  constructor() {
    this.players = new Map()
    this.pieces = new Map()
    this.spaces = new Map()
    this.gamePhase = GamePhase.PREGAME
    this.turnPhase = TurnPhase.BEGIN
    this.currentPlayerId = 1
    this.diceFaces = [0, 0, 0, 0]
    this.selectedId = null

    // init players
    const p1 = new PlayerData(1, SpaceData.P1_COL)
    const p2 = new PlayerData(2, SpaceData.P2_COL)
    this.players.set(p1.number, p1)
    this.players.set(p2.number, p2)
    console.log("Players initialized: 1=", p1, "; 2=", p2)
    
    // init pieces
    for (var i = 0; i < this.players.size; i++) {
      for (var j = 0; j < PieceData.PIECE_COUNT; j++) {
        const p = new PieceData(this.players.get(i+1) as PlayerData, 5, j)
        this.pieces.set(p.id, p)
      }
    }
    console.log("Pieces initialized: ", this.pieces)

    // init spaces
    const p1Start = new SpaceData(SpaceData.P1_COL, SpaceData.START_ROW, 'start', p1) // id === -3
    const p2Start = new SpaceData(SpaceData.P2_COL, SpaceData.START_ROW, 'start', p2) // id === -1
    const p1Finish = new SpaceData(SpaceData.P1_COL, SpaceData.FINISH_ROW, 'finish', p1) // id === -6
    const p2Finish = new SpaceData(SpaceData.P2_COL, SpaceData.FINISH_ROW, 'finish', p2) // id === -4
    this.spaces.set(p1Start.id, p1Start)
    this.spaces.set(p2Start.id, p2Start)
    this.spaces.set(p1Finish.id, p1Finish)
    this.spaces.set(p2Finish.id, p2Finish)
    
    for (var c = 0; c < SpaceData.COL_COUNT; c++) {
      for (var r = 0; r < SpaceData.ROW_COUNT; r++) {
        var section = 'middle'
        if (c === 0 || c === 2) {
          if (r === 4 || r === 5) {
            continue
          } else if (r < 4) {
            section = 'onramp'
          } else if (r > 5) {
            section = 'offramp'
          }
        }

        
        const owner = c === 0 ? p1 : (c === 2 ? p2 : null)
        const s = new SpaceData(c, r, section, owner as PlayerData, GameStateData.#getImage(c, r))
        this.spaces.set(s.id, s)
      }
    }

    console.log("Spaces initialized: ", this.spaces)

  }

  

  withSelectedId(selectedId: number|null) {
    this.selectedId = selectedId
    return this
  }

  withTurnPhase(turnPhase: TurnPhase) {
    this.turnPhase = turnPhase
    return this
  }

  withGamePhase(gamePhase: GamePhase) {
    this.gamePhase = gamePhase
    return this
  }

  withDiceFaces(diceFaces: DiceFaces) {
    this.diceFaces = diceFaces
    return this
  }

  withCurrentPlayerId(currentPlayerId: PlayerId) {
    this.currentPlayerId = currentPlayerId
    return this
  }

}

const GameState = React.createContext(new GameStateData())

export default GameState