// Saved products and recipes, per account.
import { createContext, useContext } from "react";
import { useAuth } from "./auth.jsx";
import { useUserStore } from "./userStore.js";

const FavContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [fav, setFav] = useUserStore(user?.email, "favorites", { products: [], recipes: [] });

  const has = (type, id) => fav[type].includes(id);
  // returns the new state (true = saved)
  function toggle(type, id) {
    const saved = !has(type, id);
    setFav((f) => ({
      ...f,
      [type]: saved ? [id, ...f[type]] : f[type].filter((x) => x !== id),
    }));
    return saved;
  }

  return <FavContext.Provider value={{ fav, has, toggle }}>{children}</FavContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavContext);
  if (!ctx) throw new Error("useFavorites harus dipakai di dalam <FavoritesProvider>");
  return ctx;
}
