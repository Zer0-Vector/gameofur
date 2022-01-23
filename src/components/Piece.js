import React from "react"
import { useDrag } from "react-dnd"
import './Piece.css'

function Piece({ pieceData }) {

  const { className, player, image } = pieceData

  const [, drag] = useDrag(() => ({
    type: 'piece'
  }))

  return (
    <div
      ref={drag}
      className={['piece', className, player.className()].join(' ')}
    >
      {image}
    </div>
  )
}

export default Piece
