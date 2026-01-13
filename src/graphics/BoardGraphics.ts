import type { AnimationType, AnimationParams } from "../interfaces";
import { GraphicsObject } from "./GraphicsObject";
import { Group } from "three";
import type { Vector3, Object3D } from "three";

export class BoardGraphics extends GraphicsObject {
  protected performAnimation(_animation: AnimationType, _params: AnimationParams): Promise<void> {
    // nop
    return Promise.resolve();
  }

  constructor(position: Vector3) {
    super(BoardGraphics.createBoardObject(position));
  }
  
  private static createBoardObject(_position: Vector3): Object3D {
    const mesh = new Group();
    
    return mesh;
  }
}