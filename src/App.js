import './App.css'
import Game from './components/Game'
import Player from './model/Player'
import GameContext from './model/GameContext'

function App() {
  const gameContext = {
    player1: new Player(1),
    player2: new Player(2),
    
  }
  return (
    <div className="app">
      <GameContext.Provider value={gameContext}>
          <Game />
      </GameContext.Provider>
    </div>
  );
}

export default App
