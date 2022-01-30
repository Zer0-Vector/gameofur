import React, { useContext } from "react"
import Board from './Board'
import PlayerArea from './PlayerArea'
import GameContext from "../model/GameContext"
import Box from '../containers/Box'
import './Game.css'

function Game() {

  const [context, controller] = useContext(GameContext)

  function piecesForPlayer(id) {
    return context.pieces.filter((p,i)=>(p.player.number===id))
  }

  return (
    <Box className="game">
        <Box className="player-area-container">
          <PlayerArea player={context.players[0]} pieces={piecesForPlayer(1)} />
        </Box>
        <Board />
        <Box className="player-area-container">
          <PlayerArea player={context.players[1]} pieces={piecesForPlayer(2)} />
        </Box>
    </Box>
  )
}

export default Game
