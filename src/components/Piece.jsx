import React, { useContext, useState } from "react"
import GameContext from "../model/GameContext"
import './Piece.css'

export default function Piece({ pieceData }) {

  const [,controller] = useContext(GameContext)

  const { id, player, image, selected } = pieceData

  const classes = ['piece', id, player.className]

  if (selected) {
    classes.push('selected')
  }

  const updateSelected = evt => {
    console.log("selecting piece: ", pieceData)
    controller.selectPiece(selected ? null : id)
  }

  return (
    <div
      className={classes.join(' ')}
      onClick={updateSelected}
    >
      {image}
    </div>
  )
}
