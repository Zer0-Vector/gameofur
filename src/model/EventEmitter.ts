/**
 * Simple event emitter for observable pattern.
 */
export class EventEmitter<T extends Record<string, any>> {
  private readonly listeners: Map<keyof T, Set<(data: any) => void>>;

  constructor() {
    this.listeners = new Map();
  }

  /**
   * Subscribe to an event.
   */
  on<K extends keyof T>(event: K, callback: (data: T[K]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Unsubscribe from an event.
   */
  off<K extends keyof T>(event: K, callback: (data: T[K]) => void): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * Emit an event to all subscribers.
   */
  protected emit<K extends keyof T>(event: K, data: T[K]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  /**
   * Clear all listeners.
   */
  clear(): void {
    this.listeners.clear();
  }
}
