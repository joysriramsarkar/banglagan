import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Creates a URL-friendly slug from a song title and artist.
 * Preserves Bengali characters, replaces spaces with hyphens, and removes most other symbols.
 * @param title The song title.
 * @param artist The song artist.
 * @returns A string suitable for use in a URL path segment.
 */
export const createSlug = (title: string, artist: string): string => {
  const sanitize = (text: string): string =>
    text
      .toLowerCase()
      // Keep Unicode letters (\p{L}), numbers (\p{N}), spaces, and hyphens. Remove others.
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      // Replace multiple spaces/hyphens with a single hyphen
      .trim()
      .replace(/[\s-]+/g, '-');

  const titleSlug = sanitize(title);
  const artistSlug = sanitize(artist);

  // Ensure slugs are not empty
  const safeTitleSlug = titleSlug || 'untitled';
  const safeArtistSlug = artistSlug || 'unknown-artist';

  // Combine with a separator that's unlikely to appear in names
  return `${safeTitleSlug}-by-${safeArtistSlug}`;
};