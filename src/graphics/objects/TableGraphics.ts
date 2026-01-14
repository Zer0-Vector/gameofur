import { GraphicsObject, type AnimationParams, type AnimationType } from "@/graphics";
import { Group, Vector3 } from "three";
import { BoardGraphics } from "./BoardGraphics";
import type { PieceGraphics } from "./PieceGraphics";
import type { DieGraphics } from "./DieGraphics";

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

    this._object3D.rotation.set(0, Math.PI / 2, 0);
  }

  /**
   * Expose the board for adding spaces.
   */
  get board(): BoardGraphics {
    return this.boardGraphics;
  }

  /**
   * Add a piece as a child of this table.
   */
  addPiece(piece: PieceGraphics): void {
    piece.addTo(this._object3D);
  }

  /**
   * Add a die as a child of this table.
   */
  addDie(die: DieGraphics): void {
    die.addTo(this._object3D);
  }

  /**
   * Get any graphics object by ID using the Three.js scene graph.
   */
  getObject(id: string): GraphicsObject<any> | undefined {
    const obj = this._object3D.getObjectByName(id);
    return obj?.userData.graphicsObject as GraphicsObject<any> | undefined;
  }

  /**
   * Animate any graphics object by ID.
   */
  async animateObject(id: string, animation: AnimationType, params?: AnimationParams): Promise<void> {
    const graphicsObject = this.getObject(id);
    if (graphicsObject) {
      await graphicsObject.animate(animation, params);
    }
  }

  /**
   * Update all child graphics objects (called each frame).
   */
  updateAll(deltaTime: number): void {
    this._object3D.traverse((obj) => {
      const graphicsObject = obj.userData.graphicsObject as GraphicsObject<any> | undefined;
      if (graphicsObject) {
        graphicsObject.updateVisuals(deltaTime);
      }
    });
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
