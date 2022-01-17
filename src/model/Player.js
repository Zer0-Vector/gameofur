class Player {

  constructor(number, name, avatarIdSuffix) {
    this.number = number
    this.name = name ? name : "Player " + number
    this.avatarIdSuffix = avatarIdSuffix ? avatarIdSuffix : 0
  }

  className = () => 'player' + this.number
  
  avatarId = () => this.name.replace(/\s+/, '') + this.avatarIdSuffix

}

export default Player
