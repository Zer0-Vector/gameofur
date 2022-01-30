import React, { useContext, useState } from "react"
import { useDrag } from "react-dnd"
import GameContext from "../model/GameContext"
import './Piece.css'

function Piece({ pieceData }) {

  const [,controller] = useContext(GameContext)

  const { id, player, image, selected } = pieceData

  const [, drag] = useDrag(() => ({
    type: 'piece'
  }))

  const classes = ['piece', id, player.className()]

  if (selected) {
    classes.push('selected')
  }

  const updateSelected = evt => {
    console.log("selecting piece: ", pieceData)
    controller.selectPiece(selected ? null : id)
  }

  return (
    <div
      ref={drag}
      className={classes.join(' ')}
      onClick={updateSelected}
    >
      {image}
    </div>
  )
}

export default Piece
