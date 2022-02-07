export default class PlayerData {

  static PLAYER_COUNT = 2

  constructor(number, colId, name, avatarIdSuffix) {
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
