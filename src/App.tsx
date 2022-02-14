import React from 'react'
import './App.css'
import Game from './components/Game'
import GameState, { GameStateData } from './model/GameState';

export default function App() {

  return (
    <div className="app">
      <GameState.Provider value={new GameStateData()}>
        <Game />
      </GameState.Provider>
    </div>
  );
}
