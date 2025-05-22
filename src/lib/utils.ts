
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

  let cleaned = str.normalize('NFC'); // Normalize Unicode to composed form

  // Replace characters that are not Bengali, Latin alphanumeric, or hyphen with a hyphen
  // \p{L} matches any kind of letter from any language (includes Bengali)
  // \p{N} matches any kind of numeric character in any script
  // We want to keep letters (Bengali, Latin), numbers, and hyphens. Others become hyphens.
  // Added common Bengali punctuation that might be part of titles but should be removed for slugs.
  cleaned = cleaned.replace(/[^\p{L}\p{N}-]+/gu, '-');

  // Replace multiple hyphens with a single hyphen
  cleaned = cleaned.replace(/-+/g, '-');

  // Remove leading and trailing hyphens
  cleaned = cleaned.replace(/^-+|-+$/g, '');

  // Convert to lowercase - crucial for consistent slug matching
  cleaned = cleaned.toLowerCase();


  return cleaned === "" ? undefined : cleaned;
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
        // .replace(/\s+-\s+/g, ' ') // Keep hyphens that might be intentional in lyrics for now
        // .replace(/^-+\s*|\s*-+$/g, '')
        // .replace(/([,.!?;:])-/g, '$1')
        // .replace(/-([,.!?;:])/g, '$1')
        .replace(/[ \t]+/g, ' ') // Normalize horizontal spacing
        .trim()
    )
    .join('\n');

  cleanedText = cleanedText
      .replace(new RegExp(newlinePlaceholder, 'g'), '\n')
      .replace(/\n +/g, '\n') // Remove spaces at the beginning of a line (after newline)
      .replace(/ +\n/g, '\n'); // Remove spaces at the end of a line (before newline)


  // Remove hyphens surrounded by spaces, but preserve hyphens within words or at line ends for phrasing.
  cleanedText = cleanedText.replace(/ - /g, ' '); // Specifically hyphens surrounded by spaces
  
  // Remove isolated hyphens on a line, if any are left after other cleaning
  cleanedText = cleanedText.split('\n').map(line => line.trim() === '-' ? '' : line).join('\n');


  cleanedText = cleanedText.replace(/ +/g, ' ').trim();


  return cleanedText || 'গানের কথা পাওয়া যায়নি';
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

    cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF\u00AD]/g, ''); // Remove zero-width spaces and soft hyphens
    // Preserve hyphens that are part of names but clean up those used as separators
    cleaned = cleaned.replace(/\s+-\s+/g, ' '); // Hyphens surrounded by spaces become a single space
    cleaned = cleaned.replace(/\s*\([^)]*\)\s*$/, ''); // Remove trailing parenthetical notes like (Live), (Remix)
    cleaned = cleaned.trim().replace(/\s+/g, ' '); // Trim and normalize multiple spaces to one

    // Filter out strings that are just isolated diacritics or very short potentially problematic fragments
    if (cleaned === "" || cleaned === "ঃ" || cleaned === ":" || cleaned === "-") {
        return undefined;
    }
    
    if (cleaned.length === 1 && /^[\u0981-\u0983\u09BE-\u09C4\u09C7-\u09C8\u09CB-\u09CC\u09D7\u09BC\u09CD]$/.test(cleaned)) {
        return undefined;
    }
    if (cleaned.startsWith('\u09CD')) return undefined; // Starts with Hasanta/Virama

    const problematicFragments = ["িন্দু", "ঁভূল", "িভিয়"]; 
    if (problematicFragments.includes(cleaned)) return undefined;
    
    // Specific common misspellings or variations to normalize for display
    if (cleaned === 'কাজী নজরুল ইসলম') cleaned = 'কাজী নজরুল ইসলাম';
    if (cleaned === 'দ্বিজেন্দ্রলাল রয়') cleaned = 'দ্বিজেন্দ্রলাল রায়';
    if (cleaned === 'আর ডি বর্মন') cleaned = 'রাহুল দেববর্মণ';
    if (cleaned === 'আর. ডি. বর্মন') cleaned = 'রাহুল দেববর্মণ';
    if (cleaned === 'বিভিন্ন বাউল') cleaned = 'বিভিন্ন শিল্পী';


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
  
  // For lyricistSlug, ensure "সংগৃহীত" or similar placeholders are also cleaned consistently for slug generation.
  let rawLyricistForSlug = lyricist;
  if (lyricist && (lyricist.trim() === 'সংগৃহীত' || lyricist.trim() === 'অজানা গীতিকার' || lyricist.trim() === 'প্রচলিত')) {
      rawLyricistForSlug = lyricist.trim(); // Use the placeholder as is for cleanString
  }
  const lyricistSlug = cleanString(rawLyricistForSlug);

  let baseSlugElements: string[] = [titleSlug];

  if (artistSlug !== 'অজানা-শিল্পী' && artistSlug !== 'বিভিন্ন-শিল্পী') { // Avoid adding default artist slugs
    baseSlugElements.push('by', artistSlug);
  }

  if (lyricistSlug && lyricistSlug !== 'সংগৃহীত' && lyricistSlug !== 'অজানা-গীতিকার' && lyricistSlug !== 'প্রচলিত' && lyricistSlug !== 'unknown-lyricist' ) {
    baseSlugElements.push('lyricist', lyricistSlug);
  }
  
  let baseSlug = baseSlugElements.join('-');

  if (uniqueId !== undefined && uniqueId !== null && String(uniqueId).trim() !== '') {
     const cleanedUniqueId = String(uniqueId).replace(/[\s-]+/g, '-').toLowerCase();
     return `${baseSlug}-${cleanedUniqueId}`;
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

    