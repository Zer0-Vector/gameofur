import Space from "../components/Space"

export default class SpaceData {
  static ROW_COUNT = 8

  constructor(column, row, section, owner, image, edgeClass) {
    this.id = this.column * SpaceData.ROW_COUNT + this.row
    this.column = column
    this.row = row
    this.occupant = null // null===empty space, else PieceData
    this.section = section
    this.owner = owner ? owner : null // null===middle section, else PlayerData
    this.image = image
    this.edgeClass = edgeClass
  }

  get coords() {
    if (this.section==='start' || this.section==='finish') {
      return this.owner.id + "-" + this.section
    } else {
      return `r${this.row}c${this.column}`
    }
  }
}
