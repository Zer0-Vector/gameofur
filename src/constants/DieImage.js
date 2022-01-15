import BaseImage from './BaseImage'

class DieImage extends BaseImage {

  static die0 = new DieImage('die0')
  static die1 = new DieImage('die1')

  constructor(imageName) {
    super('img-', imageName)
  }
}