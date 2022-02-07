import RacePath from "../constants/RacePath"

export default class SpaceData {
  static ROW_COUNT = 8
  static COL_COUNT = 3

  static P1_COL = 0
  static P2_COL = 2
  static START_ROW = -1
  static FINISH_ROW = -2

  static getId(column, row) {
    return column + row * SpaceData.COL_COUNT
  }

  constructor(column, row, section, owner, imageName) {
    this.id = SpaceData.getId(column, row)
    this.column = column
    this.row = row
    this.occupantId = null // null===empty space, else PieceData.id
    this.section = section
    this.ownerId = owner ? owner.number : null // null===middle section, else PlayerData.id
    this.imageName = imageName
  }

  get className() {
    if (this.id > 0) {
      return `${this.section} r${this.row} c${this.column}`
    } else {
      return `${this.section} player${this.ownerId}`
    }
  }

  pathIndex(playerId) {
    return RacePath[playerId].indexOf(this.id)
  }

}
