// useState that persists to localStorage under a per-account key and swaps
// its contents when the signed-in account changes.
import { useCallback, useEffect, useState } from "react";
import { load, save, userKey } from "./storage.js";

export function useUserStore(email, name, fallback) {
  const key = userKey(email, name);
  const [state, setState] = useState(() => ({ key, value: load(key, fallback) }));

  // account switched: load that account's data (render-phase reset pattern)
  let current = state;
  if (state.key !== key) {
    current = { key, value: load(key, fallback) };
    setState(current);
  }

  useEffect(() => {
    save(current.key, current.value);
  }, [current]);

  const set = useCallback(
    (upd) =>
      setState((s) => ({ key: s.key, value: typeof upd === "function" ? upd(s.value) : upd })),
    []
  );

  return [current.value, set];
}
