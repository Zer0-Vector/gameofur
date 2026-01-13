import type { Prettify } from "@/types";
import type { Identifiable } from "./Identifiable";

export type TypedObject<Types extends string, Type extends Types> = Prettify<Identifiable & {
  /** Type of the game object */
  type: Type;
}>