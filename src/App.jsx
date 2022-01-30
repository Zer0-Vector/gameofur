import './App.css'
import Game from './components/Game'
import GameContext from './model/GameContext'
import { useCallback, useState } from 'react'
import AppInitializer from './AppInitializer'

function App() {

  const [context, setContext] = useState(AppInitializer.initGameContext())

    const selectPiece = useCallback((pieceId) => {
      console.log("updating context: selectPiece: ", pieceId)
      setContext({
        ...context,
        pieces: context.pieces.map(p => 
          p.id===pieceId 
          ? {...p, selected: true }
          : {...p, selected: false }),
        selectedPiece: pieceId
      })
    })

    const movePiece = useCallback((pieceId, spaceId) => {
      console.log("Moving ", pieceId, " to ", spaceId)
      var occupant = null
      const pieces = context.pieces.map(p => {
        if (p.id === pieceId) {
          occupant = { ...p, selected: false, location: spaceId } // deselect on drop
          return occupant
        } else {
          return p;
        }
      })
      if (occupant !== null) {
        setContext({
          ...context,
          pieces: pieces,
          spaces: context.spaces.map(s => (
            s.id === spaceId
            ? { ...s, occupant: occupant }
            : s
          ))
        })
      } else {
        console.error("Could not find piece to move: pieceId=", pieceId, ", spaceId=", spaceId)
      }
    })

    const controller = {
      selectPiece: selectPiece,
      movePiece: movePiece,
    }

  return (
    <div className="app">
      <GameContext.Provider value={[context, controller]}>
        <Game />
      </GameContext.Provider>
    </div>
  );
}

export default App
