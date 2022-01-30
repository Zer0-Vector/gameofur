import BaseImage from "./BaseImage"

export default class PieceImage extends BaseImage {
  
  static piece0 = new PieceImage('piece0')
  static piece1 = new PieceImage('piece1')
  static piece2 = new PieceImage('piece2')
  static piece3 = new PieceImage('piece3')
  static piece4 = new PieceImage('piece4')
  static piece5 = new PieceImage('piece5')

  constructor(imageName) {
    super('img', imageName)
  }
}