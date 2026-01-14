import type { Object3D } from "three";
import { Repository } from "./Repository";
import type { GraphicsObject } from "@/graphics/GraphicsObject";
/**
 * Repository for managing graphics objects.
 */
export class GraphicsObjectRepository extends Repository<GraphicsObject<Object3D>> {

}
