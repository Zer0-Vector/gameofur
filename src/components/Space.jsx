import React, { useContext } from "react"
import TurnPhase from "../constants/TurnPhase";
import SpaceImage from "../constants/SpaceImage";
import { GameController, GameState } from "../model/GameContext"
import Piece from "./Piece";
import './Space.css'

export default function Space({ spaceData }) {

  const controller = useContext(GameController)
  const state = useContext(GameState)

  const { column, row, imageName, id } = spaceData;

  const styles = [ 'space' ]
  styles.push(imageName)
  styles.push(`r${row} c${column}`)

  function onClick(evt) {
    controller.movePiece(id)
  }

  const occupantId = state.spaces.get(id).occupantId

  const isLegalMove = controller.isLegalMove(id);

  // if something is selected, and the selected piece would land here, highlight this space; make "brighter" on hover
  if (isLegalMove) {
    styles.push('legal-move')
  }

  return (
    <div className={styles.join(' ')} onClick={isLegalMove && state.turnPhase === TurnPhase.SELECTED ? onClick : ()=>{}}>
      {SpaceImage.getImage(imageName, '10vh')}
      {occupantId ? <Piece id={occupantId} /> : null}
    </div>
  )
}
