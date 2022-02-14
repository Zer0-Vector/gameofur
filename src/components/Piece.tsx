import React, { useContext } from "react"
import { MouseEventHandler } from "react"
import GameController, { GameControllerImpl } from "../model/GameController"
import GameState, { GameStateData } from "../model/GameState"
import TurnPhase from "../constants/TurnPhase"
import './Piece.css'

type PieceProps = {
  id: number
}

export default function Piece(props: PieceProps) {

  const { id } = props
  const controller = useContext<GameControllerImpl>(GameController)
  const state = useContext<GameStateData>(GameState)
  const piece = state.pieces.get(id)
  if (!piece) {
    throw new Error("Invalid piece id. Could not find piece with id " + id)
  }
  const { player, selected, image } = piece
  const classes = ['piece', 'piece'+id, player.className]

  if (selected) {
    classes.push('selected')
  }

  const updateSelected : MouseEventHandler = () => {
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
