/**
 * Converts a habit name into a stable URL/testid-safe slug.
 * - lowercase
 * - trim outer spaces
 * - collapse repeated internal spaces to single hyphen
 * - remove non-alphanumeric characters except hyphens
 */
export function getHabitSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
