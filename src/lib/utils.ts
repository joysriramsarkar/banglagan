import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Cleans a string by removing specific problematic characters, multiple spaces,
 * problematic punctuation, and standardizes hyphens for use in slugs or internal keys.
 * Preserves Unicode letters, marks, numbers, and ensures single hyphens as separators.
 * @param str The string to clean.
 * @returns The cleaned string, suitable for slugs, or undefined if input is invalid/empty.
 */
export function cleanString(str: string | undefined | null): string | undefined {
  if (!str || typeof str !== 'string' || !str.trim()) {
    return undefined;
  }
  // Remove soft hyphens (U+00AD) and other invisible characters
  // Standardize different apostrophes/quotes to nothing (for slugs)
  // Remove most punctuation except hyphens that might be part of names
  // Replace sequences of whitespace and/or multiple hyphens with a single hyphen
  // Trim leading/trailing hyphens
  let cleaned = str
    .replace(/\u00AD/g, '') // Remove soft hyphens
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces etc.
    .replace(/[’'ʻ`´‘‛‚„“”«»‹›]/g, '') // Remove various quote/apostrophe types
    // Remove common punctuation except hyphens and parentheses (which are handled next)
    .replace(/[,\.:;!?@"#$%&*+[\]{}~^|=<>/\\]/g, '')
    // Replace parentheses
    .replace(/[()]/g, '')
    .trim(); // Trim leading/trailing whitespace first

    // Handle names like "নিধুবাবু (রামনিধি গুপ্ত)" -> "নিধুবাবু-রামনিধি-গুপ্ত"
    // Replace space immediately before or after a hyphen with a hyphen, then consolidate
    cleaned = cleaned.replace(/\s-/g, '-').replace(/-\s/g, '-');

    // Replace remaining sequences of whitespace and/or multiple hyphens with a single hyphen
    cleaned = cleaned.replace(/[\s-]+/g, '-')
    .replace(/-+/g, '-') // Ensure multiple hyphens become one
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

    return cleaned;
}


/**
 * Cleans lyrics text for display. Removes problematic characters, normalizes horizontal spaces,
 * preserves multiple consecutive newlines, and removes stray hyphens.
 * @param text The lyrics string to clean.
 * @returns The cleaned lyrics string. Returns a default message if input is invalid/empty.
 */
export function cleanLyricsForDisplay(text: string | undefined | null): string {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return 'গানের কথা পাওয়া যায়নি';
  }

  // 1. Remove specific invisible characters
  let cleanedText = text
    .replace(/\u00AD/g, '') // Remove soft hyphens
    .replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width spaces

  // 2. Preserve multiple newlines by temporarily replacing them, then clean lines
  const newlinePlaceholder = '___NEWLINE___';
  cleanedText = cleanedText.replace(/\n{2,}/g, `\n${newlinePlaceholder}\n`); // Mark breaks between stanzas

  // 3. Clean each line individually
  cleanedText = cleanedText
    .split('\n')
    .map(line => line
        // Remove hyphens unless they seem part of a compound word (heuristic)
        // This removes hyphens surrounded by space, at start/end, or potentially stray ones.
        .replace(/\s+-\s+/g, ' ') // Hyphen surrounded by spaces -> space
        .replace(/^-+\s*|\s*-+$/g, '') // Hyphens at start/end of line (with optional spaces)
        // Remove hyphens next to common punctuation (likely errors)
        .replace(/([,.!?;:])-/g, '$1')
        .replace(/-([,.!?;:])/g, '$1')
        // Normalize horizontal whitespace (spaces, tabs)
        .replace(/[ \t]+/g, ' ')
        .trim()
    )
    .join('\n');

  // 4. Restore multiple newlines and clean up resulting space issues
  cleanedText = cleanedText
      .replace(new RegExp(newlinePlaceholder, 'g'), '\n') // Restore stanza breaks
      .replace(/\n +/g, '\n') // Remove leading spaces after newline restoration
      .replace(/ +\n/g, '\n'); // Remove trailing spaces before newline restoration

  // 5. Final trim and space normalization
  cleanedText = cleanedText.replace(/ +/g, ' ').trim();

  return cleanedText;
}


/**
 * Cleans a string for display purposes.
 * Removes soft hyphens, zero-width spaces, replaces hyphens that appear to be word separators with spaces,
 * trims, and normalizes multiple spaces to one. Aims to preserve hyphens within names like 'তৌফিক-ই-ইলাহী'.
 * @param str The string to clean.
 * @returns The cleaned string, or undefined if input is invalid/empty.
 */
export function cleanDisplayString(str: string | undefined | null): string | undefined {
    if (!str || typeof str !== 'string' || !str.trim()) {
        return undefined;
    }
    // Clean invisible chars first
    let cleaned = str
        .replace(/\u00AD/g, '') // Remove soft hyphens
        .replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width spaces

    // Replace hyphens only if they are likely separators (e.g., surrounded by spaces)
    // Preserve hyphens within words like কাজী-নজরুল or তৌফিক-ই-ইলাহী
    // Replace space-hyphen-space with space.
    cleaned = cleaned.replace(/\s+-\s+/g, ' ');

    // Replace hyphens only if they are NOT surrounded by letters/digits (handles start/end and adjacent to space/punctuation)
    // This is complex, maybe simpler is better: just replace space-hyphen-space?
    // Let's stick to replacing only space-hyphen-space for display to avoid breaking names.
    // If hyphens are used instead of spaces in the source data, they will remain.

    // Normalize spaces and trim
    cleaned = cleaned.trim().replace(/\s+/g, ' ');

    // Handle specific cases like '(রামনিধি গুপ্ত)' -> 'রামনিধি গুপ্ত'
    cleaned = cleaned.replace(/\(([^)]+)\)/g, '$1').trim();
    cleaned = cleaned.replace(/\s+/g, ' '); // Re-normalize spaces after parenthesis removal

    return cleaned;
}


/**
 * Creates a URL-friendly slug from a song title, artist, and optionally lyricist.
 * Uses the `cleanString` function which handles Unicode, punctuation, and hyphenation for slugs.
 * Includes lyricist in the slug if provided and non-empty to increase uniqueness.
 * Adds a unique identifier (like an index or hash) if needed to guarantee uniqueness.
 * @param title The song title.
 * @returns A string suitable for use in a URL path segment.
 * @param artist The song artist.
 * @param lyricist The song lyricist (optional).
 * @param uniqueId A unique identifier (e.g., index) to append for guaranteed uniqueness.
 */
export const createSlug = (title?: string, artist?: string, lyricist?: string, uniqueId?: string | number): string => {
  const sanitizeForSlug = (text: string | undefined): string => {
    if (!text) return '';
    // Use cleanString to get a base hyphenated, punctuation-cleaned version
    let cleanedText = cleanString(text);
    if (!cleanedText) return '';

    // Convert to lowercase AFTER cleaning
    cleanedText = cleanedText.toLowerCase();

    // Handle specific known placeholders consistently
    if (cleanedText === "অজানা-গীতিকার") return "অজানা-গীতিকার";
    if (cleanedText === "সংগৃহীত") return "সংগৃহীত";
    if (cleanedText === "বিভিন্ন-শিল্পী") return "বিভিন্ন-শিল্পী";


    // Final check for multiple hyphens just in case cleanString missed something exotic
    return cleanedText.replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  };

  const titleSlug = sanitizeForSlug(title);
  const artistSlug = sanitizeForSlug(artist);
  const lyricistSlug = sanitizeForSlug(lyricist);

  const safeTitleSlug = titleSlug || 'শিরোনামহীন';
  const safeArtistSlug = artistSlug || 'অজানা-শিল্পী';

  let baseSlug: string;

  // Include lyricist only if it's meaningful and not a placeholder
  if (lyricistSlug && lyricistSlug !== 'সংগৃহীত' && lyricistSlug !== 'অজানা-গীতিকার') {
    baseSlug = `${safeTitleSlug}-by-${safeArtistSlug}-lyricist-${lyricistSlug}`;
  } else {
    baseSlug = `${safeTitleSlug}-by-${safeArtistSlug}`;
  }

  // Append uniqueId if provided to ensure uniqueness
  if (uniqueId !== undefined && uniqueId !== null) {
     return `${baseSlug}-${uniqueId}`;
  }

  // Fallback if no uniqueId provided, though this might lead to collisions if baseSlug isn't unique
  return baseSlug;
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