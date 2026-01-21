import type { Identifiable } from "@/interfaces";

/**
 * Generic repository for managing collections of identifiable objects.
 */
export class BasicRepository<ItemType extends Identifiable> {
  protected items: Map<string, ItemType> = new Map();

  /**
   * Add an item to the repository.
   */
  add<T extends ItemType = ItemType>(item: T): void {
    if (this.items.has(item.id)) {
      throw new Error(`Item with ID ${item.id} already exists in the repository.`);
    }
    this.items.set(item.id, item);
  }

  /**
   * Get an item by ID.
   */
  get<T extends ItemType = ItemType>(id: string): T | undefined {
    return this.items.get(id) as T;
  }

  /**
   * Remove an item by ID.
   */
  remove(id: string): boolean {
    return this.items.delete(id);
  }

  /**
   * Check if an item exists.
   */
  has(id: string): boolean {
    return this.items.has(id);
  }

  /**
   * Find items matching a predicate.
   */
  find<T extends ItemType = ItemType>(predicate: (item: ItemType) => boolean): T | undefined {
    for (const item of this.items.values()) {
      if (predicate(item)) {
        return item as T;
      }
    }
    return undefined;
  }

  /**
   * Filter items matching a predicate.
   */
  findAll<T extends ItemType = ItemType>(predicate: (item: ItemType) => boolean): T[] {
    const result: T[] = [];
    for (const item of this.items.values()) {
      if (predicate(item)) {
        result.push(item as T);
      }
    }
    return result;
  }
}
