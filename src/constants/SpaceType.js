// enum
class SpaceType {
  static start = new SpaceType('start')
  static finish = new SpaceType('finish')
  static onRamp = new SpaceType('on-ramp')
  static offRamp = new SpaceType('off-ramp')
  static middle = new SpaceType('middle')

  constructor(name) {
    this.name = name
  }

  toClassName() {
    return 'space-' + this.name
  }
}

export default SpaceType
