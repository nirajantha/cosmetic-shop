import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** True only after the client has hydrated — use to gate rendering of persisted client-only state. */
export function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
