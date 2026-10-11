// Build external links for recipe + eating-guide lookups from a dish name.
// Uses public search URLs so no API/key is needed.

export function recipeUrl(dishName) {
  const q = encodeURIComponent(`resep ${dishName}`);
  return `https://cookpad.com/id/cari/${q}`;
}

export function howToEatUrl(dishName) {
  const q = encodeURIComponent(`cara makan dan menyajikan ${dishName}`);
  return `https://www.google.com/search?q=${q}`;
}

export function videoUrl(dishName) {
  const q = encodeURIComponent(`cara membuat ${dishName}`);
  return `https://www.youtube.com/results?search_query=${q}`;
}
