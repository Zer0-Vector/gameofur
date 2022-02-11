import React, { useContext } from "react"
import './PiecesBox.css'
import Piece from "./Piece"
import { GameController } from "../model/GameContext"


export default function PiecesBox({ spaceData, pieces, player }) {
  const controller = useContext(GameController)


  const onClick = () => {
    // TODO can't finish more than one piece because it thinks it's occupied
    controller.movePiece(spaceData.id)
  }

  const classes = ['pieces-box', spaceData.className]
  const isLegal = controller.isLegalMove(spaceData.id)
  if (isLegal) {
    console.log("FINISH IS LEGAL")
    classes.push('legal-move')
  }

  return (
    <div className={classes.join(' ')} onClick={isLegal ? onClick : ()=>{}}>
      {
        pieces
          .filter(p => p.locationId === spaceData.id)
          .map((pieceData) => <Piece id={pieceData.id} key={pieceData.id} />)
      }
    </div>
  )
}
