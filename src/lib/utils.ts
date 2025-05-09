
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Cleans a string by removing specific problematic characters, multiple spaces,
 * problematic punctuation, and standardizes hyphens for use in slugs or internal keys.
 * Preserves Unicode letters, marks, numbers, and ensures single hyphens as separators.
 * Converts to lowercase.
 * @param str The string to clean.
 * @returns The cleaned string, suitable for slugs, or undefined if input is invalid/empty.
 */
export function cleanString(str: string | undefined | null): string | undefined {
  if (!str || typeof str !== 'string' || !str.trim()) {
    return undefined;
  }
  let cleaned = str
    .normalize('NFC') // Normalize Unicode to composed form
    .replace(/\u00AD/g, '') // Remove soft hyphens
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces and similar characters
    .toLowerCase(); // Convert to lowercase

  // Keep Bengali letters (\u0980-\u09FF), Latin letters (a-z), digits (0-9), spaces, and hyphens.
  // Replace everything else with a space.
  cleaned = cleaned.replace(/[^a-z0-9\u0980-\u09ff\s-]/g, ' ').trim();

  // Consolidate spaces and hyphens:
  // 1. Replace sequences of one or more whitespace characters with a single hyphen.
  // 2. Replace sequences of one or more hyphens with a single hyphen (to clean up results from step 1 or existing multiple hyphens).
  // 3. Remove leading or trailing hyphens.
  cleaned = cleaned.replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

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
        .replace(/\s+-\s+/g, ' ') 
        .replace(/^-+\s*|\s*-+$/g, '') 
        .replace(/([,.!?;:])-/g, '$1')
        .replace(/-([,.!?;:])/g, '$1')
        .replace(/[ \t]+/g, ' ')
        .trim()
    )
    .join('\n');

  // 4. Restore multiple newlines and clean up resulting space issues
  cleanedText = cleanedText
      .replace(new RegExp(newlinePlaceholder, 'g'), '\n') 
      .replace(/\n +/g, '\n') 
      .replace(/ +\n/g, '\n'); 

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
    let cleaned = str
        .replace(/\u00AD/g, '') 
        .replace(/[\u200B-\u200D\uFEFF]/g, '');

    cleaned = cleaned.replace(/\s+-\s+/g, ' ');
    cleaned = cleaned.trim().replace(/\s+/g, ' ');
    cleaned = cleaned.replace(/\(([^)]+)\)/g, '$1').trim();
    cleaned = cleaned.replace(/\s+/g, ' '); 
    // Specific fix for "কাজী নজরুল ইসলাম" where "ইসলাম" might become "ইসলম" if "া" is mishandled
    // This is a targeted fix; a more general Unicode normalization might be better if widespread.
    cleaned = cleaned.replace(/কাজী নজরুল ইসলম/g, 'কাজী নজরুল ইসলাম');
    cleaned = cleaned.replace(/দ্বিজেন্দ্রলাল রয়/g, 'দ্বিজেন্দ্রলাল রায়');


    return cleaned;
}


/**
 * Creates a URL-friendly slug from a song title, artist, and optionally lyricist.
 * Uses the `cleanString` function which handles Unicode, punctuation, and hyphenation for slugs.
 * Includes lyricist in the slug if provided and non-empty to increase uniqueness.
 * Appends a unique identifier (like an index or hash) to guarantee uniqueness.
 * @param title The song title.
 * @param artist The song artist.
 * @param lyricist The song lyricist (optional).
 * @param uniqueId A unique identifier (e.g., index) to append for guaranteed uniqueness.
 * @returns A string suitable for use in a URL path segment.
 */
export const createSlug = (title?: string, artist?: string, lyricist?: string, uniqueId?: string | number): string => {
  // `cleanString` already converts to lowercase and handles hyphenation.
  const titleSlug = cleanString(title) || 'শিরোনামহীন';
  const artistSlug = cleanString(artist) || 'অজানা-শিল্পী';
  const lyricistSlug = cleanString(lyricist); // Can be undefined

  let baseSlug: string;

  if (lyricistSlug && lyricistSlug !== 'সংগৃহীত' && lyricistSlug !== 'অজানা-গীতিকার') {
    baseSlug = `${titleSlug}-by-${artistSlug}-lyricist-${lyricistSlug}`;
  } else {
    baseSlug = `${titleSlug}-by-${artistSlug}`;
  }

  // Append uniqueId if provided to ensure uniqueness
  if (uniqueId !== undefined && uniqueId !== null && String(uniqueId).trim() !== '') {
     return `${baseSlug}-${uniqueId}`;
  }

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

