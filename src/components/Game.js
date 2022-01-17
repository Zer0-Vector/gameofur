import React from "react"
import Board from './Board'
import PlayerArea from './PlayerArea'
import GameContext from "../model/GameContext"
import Box from '../containers/Box'
import './Game.css'

class Game extends React.Component {
  static contextType = GameContext

  piecesForPlayer(id) {
    return this.context.pieces.filter((p,i)=>(p.player.number===id))
  }

  render() {
    return (
      <Box className="game">
          <Box className="player-area-container">
            <PlayerArea player={this.context.players[0]} pieces={this.piecesForPlayer(1)} />
          </Box>
          <Board />
          <Box className="player-area-container">
            <PlayerArea player={this.context.players[1]} pieces={this.piecesForPlayer(2)} />
          </Box>
      </Box>
    )
  }
}

export default Game
