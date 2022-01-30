import BaseImage from "./BaseImage"


export default class SpaceImage extends BaseImage {
  
  static rosette = new SpaceImage('rosette')
  static fourfivedots = new SpaceImage('fourfivedots')
  static bigfivedots = new SpaceImage('bigfivedots')
  static smallfivedots = new SpaceImage('smallfivedots')
  static twelvedots = new SpaceImage('twelvedots')
  static eyes0 = new SpaceImage('eyes0')
  static eyes1 = new SpaceImage('eyes1')

  constructor(imageName) {
    super('img', imageName)
  }
}
