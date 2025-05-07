
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Cleans a string by removing specific problematic characters like soft hyphens,
 * multiple spaces, and leading/trailing hyphens. Also standardizes apostrophes and some punctuation.
 * This version is primarily for generating slugs or cleaning text where hyphens are acceptable word separators.
 * @param str The string to clean.
 * @returns The cleaned string, or undefined if input is invalid/empty.
 */
export function cleanString(str: string | undefined | null): string | undefined {
  if (!str || typeof str !== 'string' || !str.trim()) {
    return undefined; // Return undefined for null, undefined, or empty/whitespace-only strings
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
 * Cleans lyrics text for display. Removes problematic characters, normalizes spaces,
 * but preserves single spaces between words (does not convert them to hyphens).
 * Keeps essential punctuation.
 * @param text The lyrics string to clean.
 * @returns The cleaned lyrics string. Returns a default message if input is invalid/empty.
 */
export function cleanLyricsForDisplay(text: string | undefined | null): string {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return 'গানের কথা পাওয়া যায়নি';
  }
  let cleanedText = text
    .replace(/\u00AD/g, '') // Remove soft hyphens
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces and similar
    .trim(); // Trim leading/trailing whitespace

  // Normalize multiple spaces to a single space, but preserve single spaces.
  cleanedText = cleanedText.replace(/\s+/g, ' ');

  return cleanedText;
}


/**
 * Creates a URL-friendly slug from a song title, artist, and optionally lyricist.
 * Preserves Bengali characters, replaces spaces with hyphens, and removes most other symbols.
 * Includes lyricist in the slug if provided and non-empty to increase uniqueness.
 * Uses the `cleanString` function which is designed for slug generation.
 * @param title The song title.
 * @param artist The song artist.
 * @param lyricist The song lyricist (optional).
 * @returns A string suitable for use in a URL path segment.
 */
export const createSlug = (title?: string, artist?: string, lyricist?: string): string => {
  // For slug generation, we use cleanString, which is designed for this (e.g., converts spaces to hyphens)
  const sanitizeForSlug = (text: string | undefined): string => {
    if (!text) return '';
    let cleanedText = cleanString(text); // cleanString will convert spaces to hyphens here
    if (!cleanedText) return '';

    return cleanedText
      .toLowerCase() // Convert to lowercase (mostly for non-Bengali parts if any)
      // Keep Unicode letters (\p{L}), marks (\p{M} for diacritics/vowel signs), numbers (\p{N}), and hyphens. Remove others.
      // Since cleanString already removed most punctuation and converted spaces to hyphens, this primarily handles character set.
      .replace(/[^\p{L}\p{M}\p{N}-]/gu, '')
      .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen (double check after cleanString)
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    };

  const titleSlug = sanitizeForSlug(title);
  const artistSlug = sanitizeForSlug(artist);
  const lyricistSlug = sanitizeForSlug(lyricist);


  const safeTitleSlug = titleSlug || 'untitled';
  const safeArtistSlug = artistSlug || 'unknown-artist';

  if (lyricistSlug && lyricistSlug !== 'সংগৃহীত' && lyricistSlug !== 'অজানা-গীতিকার' && lyricistSlug !== 'অজানা-শলপ') {
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
