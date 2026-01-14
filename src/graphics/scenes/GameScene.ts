import { Color, Scene } from "three";
import { GraphicsObject, type AnimationParams, type AnimationType } from "../GraphicsObject";

export class GameScene extends GraphicsObject<Scene> {
  constructor() {
    super("scene-game", new Scene());
    this.object3D.name = "GameScene";
    this.object3D.background = new Color(0x2a2a2a);
  }

  protected performAnimation(animation: AnimationType, params: AnimationParams): Promise<void> {
    // nop
    return Promise.resolve();
  }
}
