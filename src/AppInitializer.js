import PlayerData from './model/PlayerData'
import PieceData from './model/PieceData'
import SpaceData from './model/SpaceData'
import { PATH_END, PATH_START } from './constants/RacePath'
import GamePhase from './constants/GamePhase'
import TurnPhase from './constants/TurnPhase'

export default class AppInitializer {
  static #getImage = (col, row) => {
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

  static initGameState() {
    // init players
    const p1 = new PlayerData(1, SpaceData.P1_COL)
    const p2 = new PlayerData(2, SpaceData.P2_COL)
    const players = new Map()
    players.set(p1.number, p1)
    players.set(p2.number, p2)
    console.log("Players initialized: 1=", p1, "; 2=", p2)
    
    // init pieces
    const pieces = new Map()
    for (var i = 0; i < players.size; i++) {
      for (var j = 0; j < PieceData.PIECE_COUNT; j++) {
        const p = new PieceData(players.get(i+1), 5, j)
        pieces.set(p.id, p)
      }
    }
    console.log("Pieces initialized: ", pieces)

    // init spaces
    var spaces = new Map()
    
    const p1Start = new SpaceData(SpaceData.P1_COL, SpaceData.START_ROW, 'start', p1, PATH_START) // id === -3
    const p2Start = new SpaceData(SpaceData.P2_COL, SpaceData.START_ROW, 'start', p2, PATH_START) // id === -1
    const p1Finish = new SpaceData(SpaceData.P1_COL, SpaceData.FINISH_ROW, 'finish', p1, PATH_END) // id === -6
    const p2Finish = new SpaceData(SpaceData.P2_COL, SpaceData.FINISH_ROW, 'finish', p2, PATH_END) // id === -4
    spaces.set(p1Start.id, p1Start)
    spaces.set(p2Start.id, p2Start)
    spaces.set(p1Finish.id, p1Finish)
    spaces.set(p2Finish.id, p2Finish)
    
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
        const s = new SpaceData(c, r, section, owner, this.#getImage(c, r))
        spaces.set(s.id, s)
      }
    }

    console.log("Spaces initialized: ", spaces)

    return {
      players: players,
      pieces: pieces,
      spaces: spaces,
      gamePhase: GamePhase.INGAME,
      turnPhase: TurnPhase.PREROLL,
      currentPlayerId: 1,
      diceFaces: [0,0,0,0],
    }
  }
}