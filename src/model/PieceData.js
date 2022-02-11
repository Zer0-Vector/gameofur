import PieceImage from '../constants/PieceImage'
import SpaceData from './SpaceData'

export default class PieceData {
  static PIECE_COUNT = 7

  constructor(player, pipCount, pieceId) {
    this.player = player
    this.id = player.number * PieceData.PIECE_COUNT + pieceId
    this.className = 'piece' + player.number + '-' + pieceId
    const dim = '5vh'
    this.image = PieceImage.getPiece(pipCount, dim)
    this.selected = false
    this.locationId = SpaceData.getId(player.colId, SpaceData.START_ROW)
    console.log("Created piece: ", this.id, this.className)
  }

}
