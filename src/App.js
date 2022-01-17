import './App.css'
import Game from './components/Game'
import Player from './model/Player'
import GameContext from './model/GameContext'
import PieceData from './model/PieceData'

function App() {
  const p1 = new Player(1)
  const p2 = new Player(2)
  const players = [p1,p2]
  const pieceCount = 7;
  var pieces = new Array(pieceCount * players.length)
  for (var i = 0; i < players.length; i++) {
    for (var j = 0; j < pieceCount; j++) {
      pieces.push(new PieceData(players[i], j))
    }
  }

  return (
    <div className="app">
      <GameContext.Provider value={
          {
            players: players,
            pieces: pieces,
          }
      }>
        <Game />
      </GameContext.Provider>
    </div>
  );
}

export default App
