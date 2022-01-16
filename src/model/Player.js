class Player {

  constructor(id, name, avatarIdSuffix) {
    this.id = id
    this.name = name ? name : "Player " + id
    this.avatarIdSuffix = avatarIdSuffix ? avatarIdSuffix : 0
  }

  className = () => 'player' + this.id
  
  avatarId = () => this.name.replace(/\s+/, '') + this.avatarIdSuffix

}

export default Player