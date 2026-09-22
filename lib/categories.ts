// Shared category ordering used by both the admin category picker and the
// public "My Work" director's board, so the known categories always line up
// the same way everywhere, with anything new falling in alphabetically after.
export const PRIMARY_CATEGORY_ORDER = ["Weddings", "Food", "Promotions", "Graduations", "Videos"];

export function sortCategories(categories: string[]): string[] {
  return [...categories].sort((a, b) => {
    const ai = PRIMARY_CATEGORY_ORDER.indexOf(a);
    const bi = PRIMARY_CATEGORY_ORDER.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });
}
