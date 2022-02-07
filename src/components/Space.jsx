import React, { useContext } from "react"
import TurnPhase from "../constants/TurnPhase";
import SpaceImage from "../constants/SpaceImage";
import { GameController, GameState } from "../model/GameContext"
import Piece from "./Piece";
import './Space.css'

export default function Space({ spaceData }) {

  const controller = useContext(GameController)
  const state = useContext(GameState)

  const { column, row, imageName } = spaceData;

  const styles = [ 'space' ]
  styles.push(imageName)
  styles.push(`r${row} c${column}`)

  function onClick(evt) {
    controller.movePiece(spaceData.id)
  }

  const occupantId = state.spaces.get(spaceData.id).occupantId

  return (
    <div className={styles.join(' ')} onClick={state.turnPhase === TurnPhase.SELECTED ? onClick : ()=>{}}>
      {SpaceImage.getImage(imageName, '10vh')}
      {occupantId ? <Piece id={occupantId} /> : null}
    </div>
  )
}
