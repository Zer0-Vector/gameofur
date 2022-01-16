import React from "react"
import Board from './Board'
import PlayerArea from './PlayerArea'
import GameContext from "../model/GameContext"
import Box from '../containers/Box'
import './Game.css'

class Game extends React.Component {
  static contextType = GameContext
  render() {
    return (
      <Box className="game">
          <Box className="player-area-container">
            <PlayerArea player={this.context.player1} />
          </Box>
          <Board />
          <Box className="player-area-container">
            <PlayerArea player={this.context.player2} />
          </Box>
      </Box>
    )
  }
}

export default Game
