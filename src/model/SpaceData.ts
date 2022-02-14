import RacePath, { PlayerId } from "../constants/RacePath"
import PlayerData from "./PlayerData"

export default class SpaceData {
  static ROW_COUNT = 8
  static COL_COUNT = 3

  static P1_COL = 0
  static P2_COL = 2
  static START_ROW = -1
  static FINISH_ROW = -2

  static P1_START_ID = SpaceData.getId(SpaceData.P1_COL, SpaceData.START_ROW)
  static P2_START_ID = SpaceData.getId(SpaceData.P2_COL, SpaceData.START_ROW)
  static P1_FINISH_ID = SpaceData.getId(SpaceData.P1_COL, SpaceData.FINISH_ROW)
  static P2_FINISH_ID = SpaceData.getId(SpaceData.P2_COL, SpaceData.FINISH_ROW)

  static getId(column: number, row: number): number {
    return column + row * SpaceData.COL_COUNT
  }

  id: number
  column: number
  row: number
  occupantId: number | null
  section: string
  owner: PlayerData
  imageName: string | undefined

  constructor(column: number, row: number, section: string, owner: PlayerData, imageName?: string) {
    this.id = SpaceData.getId(column, row)
    this.column = column
    this.row = row
    this.occupantId = null // null===empty space, else PieceData.id
    this.section = section
    this.owner = owner
    this.imageName = imageName
  }

  withOccupantId(id: number|null) {
    // only set occupant id if not finishing
    if (id === SpaceData.P1_FINISH_ID || id === SpaceData.P2_FINISH_ID) {
      this.occupantId = null
    } else {
      this.occupantId = id
    }
    return this
  }

  get ownerId() {
    return this.owner ? this.owner.number : null
  }

  get className() {
    if (this.id > 0) {
      return `${this.section} r${this.row} c${this.column}`
    } else {
      return `${this.section} player${this.ownerId}`
    }
  }

  pathIndex(playerId: PlayerId) {
    return (RacePath.get(playerId) as number[]).indexOf(this.id)
  }

}
