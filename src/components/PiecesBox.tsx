import React, { useContext } from "react"
import './PiecesBox.css'
import SpaceData from "../model/SpaceData"
import PieceData from "../model/PieceData"
import PlayerData from "../model/PlayerData"
import GameController, { GameControllerImpl } from "../model/GameController"
import Piece from "./Piece"

export type PiecesBoxProps = {
  spaceData: SpaceData,
  pieces: PieceData[],
  player: PlayerData
}


export default function PiecesBox(props: PiecesBoxProps) {
  const { spaceData, pieces } = props
  const controller = useContext<GameControllerImpl>(GameController)


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
