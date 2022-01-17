class PieceData {
  constructor(player, pieceId) {
    this.player = player
    this.id = pieceId
  }

  className = () => this.player.className() + '-piece' + this.id
}

export default PieceData
