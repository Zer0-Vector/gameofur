import PlayerData from './model/PlayerData'
import PieceData from './model/PieceData'
import SpaceData from './model/SpaceData'

export default class AppInitializer {
  static initGameContext() {
    // init players
    const p1 = new PlayerData(1)
    const p2 = new PlayerData(2)
    const players = [p1,p2]
    
    // init pieces
    const pieceCount = 7;
    var pieces = new Array(pieceCount * players.length)
    for (var i = 0; i < players.length; i++) {
      for (var j = 0; j < pieceCount; j++) {
        pieces.push(new PieceData(players[i], i + '-' + j))
      }
    }

    // init spaces
    const rowCount = 8;
    const columnCount = 3; 
    const gapCount = 4;
    const bagCount = 2;
    var spaces = new Array(columnCount * rowCount - gapCount + bagCount)
    // row -1 is where the starting areas live
    spaces.push(new SpaceData(0, -1, 'start', p1))
    spaces.push(new SpaceData(2, -1, 'start', p2))
    // row -2 is where the finish areas live
    spaces.push(new SpaceData(0, -2, 'finish', p1))
    spaces.push(new SpaceData(2, -2, 'finish', p2))

    for (var c = 0; c < columnCount; c++) {
      for (var r = 0; r < rowCount; r++) {
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
        spaces.push(new SpaceData(c, r, section, owner))
      }
    }

    return {
      players: players,
      pieces: pieces,
      spaces: spaces,
      selectedPiece: null,
      currentPlayer: players[0]
    }
  }
}