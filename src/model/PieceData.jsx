import React from 'react'
import PieceImage from '../constants/PieceImage'

export default class PieceData {
  constructor(player, pieceId, pipCount) {
    this.player = player
    this.id = 'piece' + pieceId
    this.location = player.className + '-start' // SpaceData.coords
    this.pipCount = pipCount ? pipCount : 5
    const dim = '5vh'
    this.image = PieceImage.getPiece(this.pipCount, dim)
    this.selected = false
  }

}
