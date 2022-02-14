import React, { MouseEventHandler, useContext } from "react"
import TurnPhase from "../constants/TurnPhase";
import './Space.css'
import GameController, { GameControllerImpl } from "../model/GameController";
import GameState, { GameStateData } from "../model/GameState";
import SpaceData from "../model/SpaceData";
import Piece from "./Piece";
import SpaceImage from "../constants/SpaceImage";

export type SpaceProps = {
  spaceData: SpaceData
}

export default function Space(props: SpaceProps) {

  const { spaceData } = props
  const controller = useContext<GameControllerImpl>(GameController)
  const state = useContext<GameStateData>(GameState)

  const { column, row, imageName, id } = spaceData;

  const styles = [ 'space' ]
  if (imageName) {
    styles.push(imageName)
  }
  styles.push(`r${row} c${column}`)

  const onClick: MouseEventHandler = () => {
    controller.movePiece(id)
  }

  const occupantId = state.spaces.get(id)?.occupantId

  const isLegalMove = controller.isLegalMove(id);

  // if something is selected, and the selected piece would land here, highlight this space; make "brighter" on hover
  if (isLegalMove) {
    styles.push('legal-move')
  }

  return (
    <div className={styles.join(' ')} onClick={isLegalMove && state.turnPhase === TurnPhase.SELECTED ? onClick : ()=>{}}>
      {imageName ? SpaceImage.getImage(imageName, '10vh') : undefined}
      {occupantId ? <Piece id={occupantId} /> : null}
    </div>
  )
}
