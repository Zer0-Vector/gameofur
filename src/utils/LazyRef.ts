import { useRef } from "react";

/**
 * This hook ensures that the initializer function is only called once,
 * and the same instance is returned on every render.
 */
export function useLazyRef<T>(initializer: () => T): React.MutableRefObject<T> {
  const ref = useRef<T | null>(null);
  ref.current ??= initializer();
  return ref as React.MutableRefObject<T>;
}
