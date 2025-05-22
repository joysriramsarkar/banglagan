
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Cleans a string by removing specific problematic characters, multiple spaces,
 * problematic punctuation, and standardizes hyphens for use in slugs or internal keys.
 * Preserves Unicode letters, marks, numbers, and ensures single hyphens as separators.
 * Converts the string to lowercase for consistent slug generation.
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
    .replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width spaces and similar characters

  // Replace any character that is NOT a Bengali letter, a Latin letter, a digit, a space, or a hyphen, with a space.
  // The `i` flag for case-insensitivity helps if toLowerCase() is applied later.
  cleaned = cleaned.replace(/[^a-zA-Z0-9\u0980-\u09FF\s-]/g, ' ').trim();

  // Convert the entire string to lowercase for consistency in slugs.
  cleaned = cleaned.toLowerCase();

  // Consolidate multiple spaces/hyphens to single hyphens and remove leading/trailing hyphens.
  cleaned = cleaned.replace(/\s+/g, '-') // Spaces to hyphens
                   .replace(/-+/g, '-')    // Multiple hyphens to single
                   .replace(/^-+|-+$/g, ''); // Leading/trailing hyphens

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

  let cleanedText = text
    .normalize('NFC')
    .replace(/\u00AD/g, '') // Remove soft hyphens
    .replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width spaces

  const newlinePlaceholder = '___NEWLINE___';
  cleanedText = cleanedText.replace(/\n{2,}/g, `\n${newlinePlaceholder}\n`); 

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

  cleanedText = cleanedText
      .replace(new RegExp(newlinePlaceholder, 'g'), '\n') 
      .replace(/\n +/g, '\n') 
      .replace(/ +\n/g, '\n'); 

  cleanedText = cleanedText.replace(/ +/g, ' ').trim();

  return cleanedText;
}


/**
 * Cleans a string for display purposes.
 * Removes soft hyphens, zero-width spaces. Replaces hyphens surrounded by spaces with a single space.
 * Removes trailing parenthetical notes (e.g., " (Live)"). Trims and normalizes multiple spaces to one.
 * Aims to preserve hyphens within names like 'তৌফিক-ই-ইলাহী'.
 * This function does NOT convert to lowercase to preserve display casing.
 * @param str The string to clean.
 * @returns The cleaned string, or undefined if input is invalid/empty or results in junk.
 */
export function cleanDisplayString(str: string | undefined | null): string | undefined {
    if (!str || typeof str !== 'string' || !str.trim()) {
        return undefined;
    }
    let cleaned = str.normalize('NFC');

    cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '');
    cleaned = cleaned.replace(/\s+-\s+/g, ' ');
    cleaned = cleaned.replace(/\s*\([^)]*\)\s*$/, '');
    cleaned = cleaned.trim().replace(/\s+/g, ' ');

    if (cleaned === "" || cleaned === "ঃ" || cleaned === ":" || cleaned === "-") {
        return undefined;
    }

    if (cleaned.length === 1 && /^[\u0981-\u0983\u09BE-\u09C4\u09C7-\u09C8\u09CB-\u09CC\u09D7]$/.test(cleaned)) {
        return undefined;
    }
    if (cleaned.startsWith('\u09CD')) return undefined; 

    const problematicFragments = ["িন্দু", "ঁভূল", "িভিয়"];
    if (problematicFragments.includes(cleaned)) return undefined;

    const allowedShortNames = ["ও", "এ", "বা", "মা", "বিভিন্ন শিল্পী", "কাজী নজরুল ইসলাম"]; // Added "কাজী নজরুল ইসলাম"
    if (cleaned.length <= 2 && !allowedShortNames.includes(cleaned)) {
        if (cleaned === "ভী" || cleaned === "সু" ) { // Removed "দ্বিজেন্দ্রলাল রয়" as it's longer
             if (cleaned !== "দ্বিজেন্দ্রলাল রায়") return undefined; // Ensure "দ্বিজেন্দ্রলাল রায়" is not filtered
        }
    }
    
    if (cleaned === 'কাজী নজরুল ইসলম') cleaned = 'কাজী নজরুল ইসলাম';
    if (cleaned === 'দ্বিজেন্দ্রলাল রয়') cleaned = 'দ্বিজেন্দ্রলাল রায়';


    return cleaned === "" ? undefined : cleaned;
}


/**
 * Creates a URL-friendly slug from a song title, artist, and optionally lyricist.
 * Uses the `cleanString` function which handles Unicode, punctuation, hyphenation, and lowercasing for slugs.
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

  if (lyricistSlug && lyricistSlug !== 'সংগৃহীত' && lyricistSlug !== 'অজানা-গীতিকার' && lyricistSlug !== 'অজানা গীতিকার' && lyricistSlug !== 'unknown-lyricist') {
    baseSlug = `${titleSlug}-by-${artistSlug}-lyricist-${lyricistSlug}`;
  } else {
    baseSlug = `${titleSlug}-by-${artistSlug}`;
  }

  if (uniqueId !== undefined && uniqueId !== null && String(uniqueId).trim() !== '') {
     return `${baseSlug}-${String(uniqueId).replace(/\s+/g, '-')}`;
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
