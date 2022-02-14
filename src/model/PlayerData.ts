export default class PlayerData {

  static PLAYER_COUNT = 2

  number: number
  name: string
  colId: number
  avatarIdSuffix: number


  constructor(number: number, colId: number, name?: string | undefined, avatarIdSuffix?: number | undefined) {
    this.number = number
    this.name = name ? name : "Player " + number
    this.avatarIdSuffix = avatarIdSuffix ? avatarIdSuffix : 0
    this.colId = colId
  }

  get className() {
    return 'player' + this.number
  }
  
  get avatarId() {
    return this.name.replace(/\s+/, '') + this.avatarIdSuffix
  }

}
