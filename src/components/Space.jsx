import React, { useCallback, useContext } from "react"
import SpaceImage from "../constants/SpaceImage";
import GameContext from "../model/GameContext"
import Piece from "./Piece";
import './Space.css'

export default function Space({ image, locationClass }) {

  const styles = [ 'space' ]
  styles.push(image)
  styles.push(locationClass)

  const [context, controller] = useContext(GameContext)
  const occupant = context.pieces.find(element => {
    if (!element) return false
    return element.location === locationClass
  })

  const onClick = useCallback(evt => {
    if (context.selectedPiece) {
      if (occupant && context.selectedPiece.location !== locationClass) {
        controller.selectPiece(null)
        return
      }
      console.log('Moving piece!', context.selectedPiece, locationClass)
      controller.movePiece(locationClass)
    }
  }, [context, controller, locationClass, occupant])


  return (
    <div className={styles.join(' ')} onClick={onClick.bind(this)}>
      {SpaceImage.getImage(image, '10vh')}
      {occupant ? <Piece pieceData={occupant} /> : null}
    </div>
  )
}
