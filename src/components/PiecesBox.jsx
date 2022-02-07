import React from "react"
import './PiecesBox.css'
import Piece from "./Piece"


export default function PiecesBox({ spaceData, pieces, player }) {
  return (
    <div className={"pieces-box " + spaceData.className}>
      {
        pieces
          .filter(p => p.locationId === spaceData.id)
          .map((pieceData) => <Piece id={pieceData.id} key={pieceData.id} />)
      }
    </div>
  )
}
