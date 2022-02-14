import React from 'react'
import {ReactComponent as Piece5} from '../images/piece5.svg'
import {ReactComponent as Piece4} from '../images/piece4.svg'
import {ReactComponent as Piece3} from '../images/piece3.svg'
import {ReactComponent as Piece2} from '../images/piece2.svg'
import {ReactComponent as Piece1} from '../images/piece1.svg'
import {ReactComponent as Piece0} from '../images/piece0.svg'

export default class PieceImage {
  static getPiece(pips: number, dim: string) {
    switch (pips) {
      case 0:
        return <Piece0 className="piece0" width={dim} height={dim} />
      case 1:
        return <Piece1 className="piece1" width={dim} height={dim} />
      case 2:
        return <Piece2 className="piece2" width={dim} height={dim} />
      case 3:
        return <Piece3 className="piece3" width={dim} height={dim} />
      case 4:
        return <Piece4 className="piece4" width={dim} height={dim} />
      case 5:
        return <Piece5 className="piece5" width={dim} height={dim} />
    }
  }
}