import React from "react"
import './PiecesBox.css'
import Piece from "./Piece"


export default function PiecesBox({ pieces, player }) {
  var location = player.className + "-start"
  return (
    <div className={"pieces-box " + location}>
      {pieces.filter(p => p.location === location).map((pieceData) => <Piece pieceData={pieceData} key={pieceData.id} />)}
    </div>
  )
}
