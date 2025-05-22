
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

  // Remove zero-width spaces, soft hyphens, etc. which can be invisible but affect processing
  cleaned = cleaned.replace(/[\u00AD\u200B-\u200D\uFEFF]/g, '');

  let result = '';
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const charCode = cleaned.charCodeAt(i);

    // Check for standard Latin alphanumerics
    if ((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || (char >= '0' && char <= '9')) {
      result += char;
    }
    // Check for Bengali Unicode block (covers letters, vowel signs, numerals, etc.)
    else if (charCode >= 0x0980 && charCode <= 0x09FF) {
      result += char;
    }
    // Allow hyphens and spaces to be processed later
    else if (char === ' ' || char === '-') {
      result += char;
    }
    // Replace any other character with a space
    else {
      result += ' ';
    }
  }
  cleaned = result.trim();


  // Convert multiple spaces/hyphens to single hyphens and remove leading/trailing hyphens.
  cleaned = cleaned.replace(/[\s-]+/g, '-'); // Replace one or more spaces or hyphens with a single hyphen
  cleaned = cleaned.replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  cleaned = cleaned.toLowerCase(); // Convert to lowercase for consistent slugs

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

  // Remove hyphens that are not part of a word (e.g., "word - word" becomes "word word")
  // but preserve hyphens within words (e.g., "e-mail", "co-operate").
  // This regex looks for hyphens surrounded by spaces or at the beginning/end of lines after trim.
  // However, for lyrics, we need to be careful not to remove hyphens used for phrasing or line breaks.
  // The previous steps handle most stray hyphens. This specific replacement might be too broad.
  // Consider if specific hyphen patterns in lyrics need preservation.
  // For now, focusing on space normalization.
  cleanedText = cleanedText.replace(/ +- +/g, ' '); // Hyphens surrounded by spaces


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
    cleaned = cleaned.replace(/\s+-\s+/g, ' '); // Hyphens surrounded by spaces become a single space
    cleaned = cleaned.replace(/\s*\([^)]*\)\s*$/, ''); // Remove trailing parenthetical notes like (Live), (Remix)
    cleaned = cleaned.trim().replace(/\s+/g, ' '); // Trim and normalize multiple spaces to one

    // Filter out strings that are just isolated diacritics or very short potentially problematic fragments
    if (cleaned === "" || cleaned === "ঃ" || cleaned === ":" || cleaned === "-") {
        return undefined;
    }
    // Check for single character strings that are only diacritics (common in Bengali script)
    // This regex checks for common Bengali vowel signs and other marks if they appear alone.
    if (cleaned.length === 1 && /^[\u0981-\u0983\u09BE-\u09C4\u09C7-\u09C8\u09CB-\u09CC\u09D7\u09BC\u09CD]$/.test(cleaned)) {
        return undefined;
    }
    if (cleaned.startsWith('\u09CD')) return undefined; // Starts with Hasanta/Virama

    // Specific problematic fragments that might result from over-cleaning or bad data
    const problematicFragments = ["িন্দু", "ঁভূল", "িভিয়"]; // Add more as identified
    if (problematicFragments.includes(cleaned)) return undefined;

    // Allow specific short names that are valid
    const allowedShortNames = ["ও", "এ", "বা", "মা", "বিভিন্ন শিল্পী", "কাজী নজরুল ইসলাম", "দ্বিজেন্দ্রলাল রায়"];
    if (cleaned.length <= 2 && !allowedShortNames.some(name => name === cleaned || cleaned.startsWith(name + " "))) { // Check exact match or start of a multi-word name
        // Additional check for very short Bengali names common in lists if they are not full words
        if (cleaned === "ভী" || cleaned === "সু" ) {
             if (cleaned !== "দ্বিজেন্দ্রলাল রায়") return undefined;
        }
    }
    
    // Specific common misspellings or variations to normalize for display
    if (cleaned === 'কাজী নজরুল ইসলম') cleaned = 'কাজী নজরুল ইসলাম';
    if (cleaned === 'দ্বিজেন্দ্রলাল রয়') cleaned = 'দ্বিজেন্দ্রলাল রায়'; // Standardize Roy/Ray
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
  const lyricistSlug = cleanString(lyricist); // This can be undefined if lyricist is not provided or cleans to empty

  let baseSlugElements: string[] = [titleSlug];

  // Only add artist if it's not the default placeholder.
  // This helps in cases where artist might be truly unknown and shouldn't clutter the slug.
  if (artistSlug !== 'অজানা-শিল্পী') {
    baseSlugElements.push('by', artistSlug);
  }

  // Only add lyricist if it's valid and not a generic placeholder.
  if (lyricistSlug && lyricistSlug !== 'সংগৃহীত' && lyricistSlug !== 'অজানা-গীতিকার' && lyricistSlug !== 'অজানা গীতিকার' && lyricistSlug !== 'unknown-lyricist') {
    baseSlugElements.push('lyricist', lyricistSlug);
  }
  
  let baseSlug = baseSlugElements.join('-');

  // Append uniqueId if provided and valid
  if (uniqueId !== undefined && uniqueId !== null && String(uniqueId).trim() !== '') {
     const cleanedUniqueId = String(uniqueId).replace(/\s+/g, '-'); // Clean the ID just in case
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
