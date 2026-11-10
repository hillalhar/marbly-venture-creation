// Resolve a dish name to an IN-APP recipe route. No external links.
import { findRecipeByName } from "../data/recipes.js";

// Returns a local path like "/resep/rendang" if we have the recipe, else the
// recipe list page as a fallback.
export function recipePath(dishName) {
  const r = findRecipeByName(dishName);
  return r ? `/resep/${r.id}` : "/resep";
}
