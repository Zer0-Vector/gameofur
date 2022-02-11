import React, { useContext } from "react"
import TurnPhase from "../constants/TurnPhase"
import { GameController, GameState } from "../model/GameContext"
import './Piece.css'

export default function Piece({ id }) {

  const controller = useContext(GameController)
  const state = useContext(GameState)
  const { player, selected, image } = state.pieces.get(id)
  const classes = ['piece', 'piece'+id, player.className]

  if (selected) {
    classes.push('selected')
  }

  const updateSelected = evt => {
    console.log("selecting piece: ", id)
    controller.selectPiece(selected ? null : id)
  }

  const canSelect = () => (
    (state.turnPhase === TurnPhase.PRESELECT || state.turnPhase === TurnPhase.SELECTED)
    && state.currentPlayerId === player.number
  )

  return (
    <div
      className={classes.join(' ')}
      onClick={canSelect() ? updateSelected : ()=>{}}
    >
      {image}
    </div>
  )
}
