import type { Identifiable } from "@/interfaces";

/**
 * Generic repository for managing collections of identifiable objects.
 */
export class Repository<T extends Identifiable> {
  protected items: Map<string, T> = new Map();

  /**
   * Add an item to the repository.
   */
  add(item: T): void {
    this.items.set(item.id, item);
  }

  /**
   * Get an item by ID.
   */
  get(id: string): T | undefined {
    return this.items.get(id);
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
   * Get all items.
   */
  getAll(): T[] {
    return Array.from(this.items.values());
  }

  /**
   * Get all items as a map.
   */
  getAllMap(): Map<string, T> {
    return new Map(this.items);
  }

  /**
   * Clear all items.
   */
  clear(): void {
    this.items.clear();
  }

  /**
   * Get the count of items.
   */
  get count(): number {
    return this.items.size;
  }

  /**
   * Iterate over all items.
   */
  forEach(callback: (item: T, id: string) => void): void {
    this.items.forEach(callback);
  }

  /**
   * Find items matching a predicate.
   */
  find(predicate: (item: T) => boolean): T | undefined {
    return Array.from(this.items.values()).find(predicate);
  }

  /**
   * Filter items matching a predicate.
   */
  filter(predicate: (item: T) => boolean): T[] {
    return Array.from(this.items.values()).filter(predicate);
  }
}
