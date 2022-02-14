import PieceImage from '../constants/PieceImage'
import SpaceData from './SpaceData'
import PlayerData from './PlayerData'

export default class PieceData {
  static PIECE_COUNT = 7

  player: PlayerData
  id: number
  className: string
  selected: boolean
  locationId: number
  image: JSX.Element

  constructor(player: PlayerData, pipCount: number, pieceId: number) {
    this.player = player
    this.id = player.number * PieceData.PIECE_COUNT + pieceId
    this.className = 'piece' + player.number + '-' + pieceId
    const dim = '5vh'
    this.image = PieceImage.getPiece(pipCount, dim) as JSX.Element
    this.selected = false
    this.locationId = SpaceData.getId(player.colId, SpaceData.START_ROW)
    console.log("Created piece: ", this.id, this.className)
  }

}
