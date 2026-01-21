import type { Identifiable } from "@/interfaces";

export interface Repository<ItemType extends Identifiable<any>> {
  add<T extends ItemType = ItemType>(item: T): void;
  remove<T extends ItemType = ItemType>(item: T): void;
  find<T extends ItemType = ItemType>(predicate: (item: ItemType) => boolean): T | undefined;
  findAll<T extends ItemType = ItemType>(predicate: (item: ItemType) => boolean): T[];
}
