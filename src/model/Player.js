class Player {

  constructor(id) {
    this.id = id
  }

  toClassName = () => 'player' + this.id
  
}

export default Player