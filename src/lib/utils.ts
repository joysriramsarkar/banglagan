
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Cleans a string by removing specific problematic characters like soft hyphens,
 * multiple spaces, and leading/trailing hyphens. Also standardizes apostrophes and some punctuation.
 * @param str The string to clean.
 * @returns The cleaned string.
 */
export function cleanString(str: string | undefined | null): string | undefined {
  if (typeof str !== 'string') {
    return undefined; // Return undefined for null or non-string inputs
  }
  // Remove soft hyphens (U+00AD) and other problematic invisible characters
  // Also trim whitespace and replace multiple hyphens/spaces with a single hyphen
  // Standardize apostrophes and remove some punctuation that might break slugs
  return str
    .replace(/\u00AD/g, '') // Remove soft hyphens
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces and similar
    .replace(/[’']/g, '') // Remove apostrophes and single quotes (problematic for slugs)
    .replace(/[,\.:;"“”‘’«»()\[\]{}!?]/g, '') // Remove common punctuation marks
    .trim() // Trim leading/trailing whitespace
    .replace(/\s+/g, '-'); // Replace spaces with hyphens
}


/**
 * Creates a URL-friendly slug from a song title, artist, and optionally lyricist.
 * Preserves Bengali characters, replaces spaces with hyphens, and removes most other symbols.
 * Includes lyricist in the slug if provided and non-empty to increase uniqueness.
 * @param title The song title.
 * @param artist The song artist.
 * @param lyricist The song lyricist (optional).
 * @returns A string suitable for use in a URL path segment.
 */
export const createSlug = (title?: string, artist?: string, lyricist?: string): string => {
  const sanitize = (text: string | undefined): string => {
    if (!text) return '';
    // Apply initial cleaning
    let cleanedText = cleanString(text);
    if (!cleanedText) return '';

    return cleanedText
      .toLowerCase() // Convert to lowercase (mostly for non-Bengali parts if any)
      // Keep Unicode letters (\p{L}), marks (\p{M} for diacritics/vowel signs), numbers (\p{N}), and hyphens. Remove others.
      .replace(/[^\p{L}\p{M}\p{N}-]/gu, '')
      // Replace multiple hyphens with a single hyphen
      .replace(/-+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, '');
    };

  const titleSlug = sanitize(title);
  const artistSlug = sanitize(artist);
  const lyricistSlug = sanitize(lyricist);


  // Ensure slugs are not empty, using placeholders if necessary
  const safeTitleSlug = titleSlug || 'untitled';
  const safeArtistSlug = artistSlug || 'unknown-artist';

  // Combine with separators, including lyricist if available and non-empty
  if (lyricistSlug && lyricistSlug !== 'সংগৃহীত' && lyricistSlug !== 'অজানা-গীতিকার') {
    return `${safeTitleSlug}-by-${safeArtistSlug}-lyricist-${lyricistSlug}`;
  } else {
    return `${safeTitleSlug}-by-${safeArtistSlug}`;
  }
};

/**
 * Converts a number or string containing Arabic numerals to Bengali numerals.
 * @param num The number or string to convert.
 * @returns A string with Bengali numerals. Returns an empty string if input is undefined or null.
 */
export const toBengaliNumerals = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null) return '';
  const numStr = String(num);
  const bengaliDigits: { [key: string]: string } = {
    '0': '০',
    '1': '১',
    '2': '২',
    '3': '৩',
    '4': '৪',
    '5': '৫',
    '6': '৬',
    '7': '৭',
    '8': '৮',
    '9': '৯',
  };
  return numStr.replace(/[0-9]/g, (digit) => bengaliDigits[digit] || digit);
};

