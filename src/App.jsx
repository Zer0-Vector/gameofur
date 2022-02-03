import './App.css'
import Game from './components/Game'
import GameContext from './model/GameContext'
import { useState } from 'react'
import AppInitializer from './AppInitializer'
import Controller from './Controller'

function App() {

  const [context, setContext] = useState(AppInitializer.initGameContext())

  const controller = Controller(context, setContext)

  return (
    <div className="app">
      <GameContext.Provider value={[context, controller]}>
        <Game />
      </GameContext.Provider>
    </div>
  );
}

export default App
