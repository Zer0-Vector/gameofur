import React, { useContext } from "react"
import Board from './Board'
import PlayerArea from './PlayerArea'
import GameContext from "../model/GameContext"
import './Game.css'

function Game() {

  const [context, controller] = useContext(GameContext)

  function piecesForPlayer(id) {
    return context.pieces.filter((p,i)=>(p.player.number===id))
  }

  return (
    <div className="game">
        <div className="player-area-container">
          <PlayerArea player={context.players[0]} pieces={piecesForPlayer(1)} />
        </div>
        <Board />
        <div className="player-area-container">
          <PlayerArea player={context.players[1]} pieces={piecesForPlayer(2)} />
        </div>
    </div>
  )
}

export default Game
