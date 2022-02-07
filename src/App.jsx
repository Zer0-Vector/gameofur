import React from 'react'
import './App.css'
import Game from './components/Game'
import { GameState } from './model/GameContext'
import AppInitializer from './AppInitializer'

export default function App() {

  return (
    <div className="app">
      <GameState.Provider value={AppInitializer.initGameState()}>
        <Game />
      </GameState.Provider>
    </div>
  );
}
