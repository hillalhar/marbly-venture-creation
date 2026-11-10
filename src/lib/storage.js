// Small localStorage helpers. All app data lives client-side in this prototype.

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* storage full or blocked — ignore */
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

// Per-account key, so each user has their own cart, orders, fridge, etc.
export function userKey(email, name) {
  return `marbly.u.${String(email || "guest").toLowerCase()}.${name}`;
}

export const uid = (prefix = "") =>
  prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
