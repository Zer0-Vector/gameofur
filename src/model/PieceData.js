import React from 'react'
import {ReactComponent as Piece5} from '../images/piece5.svg'
import {ReactComponent as Piece4} from '../images/piece4.svg'
import {ReactComponent as Piece3} from '../images/piece3.svg'
import {ReactComponent as Piece2} from '../images/piece2.svg'
import {ReactComponent as Piece1} from '../images/piece1.svg'
import {ReactComponent as Piece0} from '../images/piece0.svg'

class PieceData {
  constructor(player, pieceId, pipCount) {
    this.player = player
    this.id = 'piece' + pieceId
    this.location = 'start' // SpaceData.coords
    this.pipCount = pipCount ? pipCount : 5
    const dim = '5vh'
    this.image = (() => {
      switch (this.pipCount) {
        case 0:
          return <Piece0 width={dim} height={dim} />
        case 1:
          return <Piece1 width={dim} height={dim} />
        case 2:
          return <Piece2 width={dim} height={dim} />
        case 3:
          return <Piece3 width={dim} height={dim} />
        case 4:
          return <Piece4 width={dim} height={dim} />
        default:
          return <Piece5 width={dim} height={dim} />
      }
    })()
    this.selected = false
  }

}

export default PieceData
