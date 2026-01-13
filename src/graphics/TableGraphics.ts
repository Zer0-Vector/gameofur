import type { AnimationType, AnimationParams } from "../interfaces";
import { GraphicsObject } from "./GraphicsObject";
import { Group } from "three";
import type { Vector3, Object3D } from "three";

export class TableGraphics extends GraphicsObject {
  protected performAnimation(_animation: AnimationType, _params: AnimationParams): Promise<void> {
    // nop
    return Promise.resolve();
  }
  
  constructor(position: Vector3) {
    super(TableGraphics.createTableGroup(position));
  }

  static createTableGroup(position: Vector3): Object3D {
    const tableGroup = new Group();
    tableGroup.position.copy(position);
    return tableGroup;
  }


}