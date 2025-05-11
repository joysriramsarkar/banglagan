
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

  // 1. Remove specific invisible characters and normalize
  let cleanedText = text
    .normalize('NFC')
    .replace(/\u00AD/g, '') // Remove soft hyphens
    .replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width spaces

  // 2. Preserve multiple newlines by temporarily replacing them, then clean lines
  const newlinePlaceholder = '___NEWLINE___';
  cleanedText = cleanedText.replace(/\n{2,}/g, `\n${newlinePlaceholder}\n`); // Mark breaks between stanzas

  // 3. Clean each line individually
  cleanedText = cleanedText
    .split('\n')
    .map(line => line
        .replace(/\s+-\s+/g, ' ') // Replace space-hyphen-space with space
        .replace(/^-+\s*|\s*-+$/g, '') // Remove leading/trailing hyphens on a line
        .replace(/([,.!?;:])-/g, '$1') // Remove hyphen after punctuation
        .replace(/-([,.!?;:])/g, '$1') // Remove hyphen before punctuation
        .replace(/[ \t]+/g, ' ') // Normalize horizontal spaces to single space
        .trim()
    )
    .join('\n');

  // 4. Restore multiple newlines and clean up resulting space issues
  cleanedText = cleanedText
      .replace(new RegExp(newlinePlaceholder, 'g'), '\n') // Restore paragraph breaks
      .replace(/\n +/g, '\n') // Remove spaces at the beginning of a line after newline
      .replace(/ +\n/g, '\n'); // Remove spaces at the end of a line before newline

  // 5. Final trim and space normalization
  cleanedText = cleanedText.replace(/ +/g, ' ').trim();

  return cleanedText;
}


/**
 * Cleans a string for display purposes.
 * Removes soft hyphens, zero-width spaces. Replaces hyphens surrounded by spaces with a single space.
 * Removes trailing parenthetical notes (e.g., " (Live)"). Trims and normalizes multiple spaces to one.
 * Aims to preserve hyphens within names like 'তৌফিক-ই-ইলাহী'.
 * @param str The string to clean.
 * @returns The cleaned string, or undefined if input is invalid/empty or results in junk.
 */
export function cleanDisplayString(str: string | undefined | null): string | undefined {
    if (!str || typeof str !== 'string' || !str.trim()) {
        return undefined;
    }
    let cleaned = str.normalize('NFC');

    // Remove specific invisible characters
    cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '');

    // Replace hyphens used as separators (surrounded by space) with a single space
    cleaned = cleaned.replace(/\s+-\s+/g, ' ');

    // Remove trailing parenthetical notes, e.g., " (Album Version)" or " (বাংলাদেশি)"
    cleaned = cleaned.replace(/\s*\([^)]*\)\s*$/, '');

    // Trim whitespace and consolidate multiple spaces into one
    cleaned = cleaned.trim().replace(/\s+/g, ' ');

    // If empty after basic cleaning, or specific junk characters, return undefined
    if (cleaned === "" || cleaned === "ঃ" || cleaned === ":" || cleaned === "-") {
        return undefined;
    }

    // Filter out if it's a single isolated diacritic.
    // Bengali Vowel Signs: \u09BE (া) to \u09C4 (ৗ), also \u0981 (ঁ) Chandrabindu, \u0982 (ং) Anusvara, \u0983 (ঃ) Visarga
    // Also \u09C7 (ে) \u09C8 (ৈ) \u09CB (ো) \u09CC (ৌ) \u09D7 (ৗ) - these are vowel signs
    if (cleaned.length === 1 && /^[\u0981-\u0983\u09BE-\u09C4\u09C7-\u09C8\u09CB-\u09CC\u09D7]$/.test(cleaned)) {
        return undefined;
    }

    // Filter out strings that are likely fragments or erroneous after initial cleaning
    // e.g., starts/ends with a halant, or specific known problematic fragments.
    if (cleaned.startsWith('\u09CD')) return undefined; // Starts with halant

    const problematicFragments = ["িন্দু", "ঁভূল", "িভিয়"];
    if (problematicFragments.includes(cleaned)) return undefined;

    // Filter out very short strings (length 1 or 2) that are just a consonant with a simple vowel sign
    // (like "ভী", "সু") if they are not common single/double-letter words/names.
    // This is subjective and might need adjustment if valid short names are filtered.
    const allowedShortNames = ["ও", "এ", "বা", "মা", "বিভিন্ন শিল্পী"]; // "বিভিন্ন শিল্পী" is longer but crucial to keep
    if (cleaned.length <= 2 && !allowedShortNames.includes(cleaned)) {
        // Check if it's a single consonant + vowel sign, or just a single consonant
        // Example: "ক", "কা", "কি"
        // Filter if it looks like "ভী" or "সু" and is not in allowedShortNames
        if (cleaned === "ভী" || cleaned === "সু") {
            return undefined;
        }
    }

    // Specific known corrections (use sparingly, prefer fixing source data or general logic)
    if (cleaned === 'কাজী নজরুল ইসলম') cleaned = 'কাজী নজরুল ইসলাম';
    if (cleaned === 'দ্বিজেন্দ্রলাল রয়') cleaned = 'দ্বিজেন্দ্রলাল রায়';


    return cleaned === "" ? undefined : cleaned; // Final check for empty string
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
  const titleSlug = cleanString(title) || 'শিরোনামহীন';
  const artistSlug = cleanString(artist) || 'অজানা-শিল্পী';
  const lyricistSlug = cleanString(lyricist);

  let baseSlug: string;

  if (lyricistSlug && lyricistSlug !== 'সংগৃহীত' && lyricistSlug !== 'অজানা-গীতিকার' && lyricistSlug !== 'অজানা গীতিকার') {
    baseSlug = `${titleSlug}-by-${artistSlug}-lyricist-${lyricistSlug}`;
  } else {
    baseSlug = `${titleSlug}-by-${artistSlug}`;
  }

  if (uniqueId !== undefined && uniqueId !== null && String(uniqueId).trim() !== '') {
     return `${baseSlug}-${String(uniqueId).replace(/\s+/g, '-')}`; // Ensure uniqueId is also cleaned for URL
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

