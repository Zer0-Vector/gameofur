import './App.css'
import Game from './components/Game'
import PlayerData from './model/PlayerData'
import GameContext from './model/GameContext'
import PieceData from './model/PieceData'
import SpaceData from './model/SpaceData'
import SpaceImage from './constants/SpaceImage'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

function App() {
  const p1 = new PlayerData(1)
  const p2 = new PlayerData(2)
  const players = [p1,p2]
  const pieceCount = 7;
  var pieces = new Array(pieceCount * players.length)
  for (var i = 0; i < players.length; i++) {
    for (var j = 0; j < pieceCount; j++) {
      pieces.push(new PieceData(players[i], j))
    }
  }

  const getImage = (col, row) => {
    switch (col) {
      case 0:
      case 2:
        switch (row) {
          case 0:
          case 6:
            return SpaceImage.rosette
          case 1:
            return SpaceImage.eyes1
          case 2:
            return SpaceImage.bigfivedots
          case 3:
            return SpaceImage.eyes0
          case 7:
            return SpaceImage.smallfivedots
          default:
            return null
        }
      case 1:
        switch (row) {
          case 0:
            return SpaceImage.twelvedots
          case 1:
          case 4:
          case 7:
             return SpaceImage.bigfivedots
          case 2:
          case 5:
            return SpaceImage.fourfivedots
          case 3:
            return SpaceImage.rosette
          case 6:
            return SpaceImage.eyes0
          default:
            return null
        }
      default:
        return null
    }
  }

  const getEdgeClass = (col, row) => {
    var result = []
    if (col === 0) {
      result.push('left')
    } else if (col === 2) {
      result.push('right')
    }
    if (row === 0) {
      result.push('top')
    } else if (row === 7) {
      result.push('bottom')
    }

    return result.join(' ')
  }

  const rowCount = 8;
  const columnCount = 3; 
  const gapCount = 4;
  const bagCount = 2;
  var spaces = new Array(columnCount * rowCount - gapCount + bagCount)
  // row -1 is where the bags live
  spaces.push(new SpaceData(0, -1, 'start', p1))
  spaces.push(new SpaceData(2, -1, 'start', p2))
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
      spaces.push(new SpaceData(c, r, section, owner, getImage(c, r), getEdgeClass(c, r)))
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <GameContext.Provider value={
            {
              players: players,
              pieces: pieces,
              spaces: spaces,
            }
        }>
          <Game />
        </GameContext.Provider>
      </div>
    </DndProvider>
  );
}

export default App
