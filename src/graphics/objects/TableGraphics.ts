import { GraphicsObject, type AnimationParams, type AnimationType } from "@/graphics";
import { Group, Vector3 } from "three";
import { BoardGraphics } from "./BoardGraphics";

export class TableGraphics extends GraphicsObject<Group> {
  private readonly boardGraphics: BoardGraphics;

  protected performAnimation(_animation: AnimationType, _params: AnimationParams): Promise<void> {
    // nop
    return Promise.resolve();
  }

  constructor(position: Vector3 = new Vector3()) {
    super("table", TableGraphics.createTableGroup(position));

    // Create and add the board
    this.boardGraphics = new BoardGraphics();
    this.boardGraphics.addTo(this._object3D);
  }

  private static createTableGroup(position: Vector3): Group {
    const tableGroup = new Group();
    tableGroup.position.copy(position);
    return tableGroup;
  }

  dispose(): void {
    this.boardGraphics.dispose();
    super.dispose();
  }
}
