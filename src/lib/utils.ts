
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Cleans a string for use in slugs or general processing.
 * Converts to lowercase, normalizes, replaces spaces and problematic chars with hyphens.
 * @param str The string to clean.
 * @param defaultVal The default string to return if cleaning fails or input is invalid.
 * @returns The cleaned string, suitable for slugs, or the defaultVal.
 */
export function cleanString(str: string | undefined | null, defaultVal: string = 'unknown'): string {
  if (!str || typeof str !== 'string' || !str.trim()) {
    return defaultVal.toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-');
  }

  let cleaned = str
    .normalize('NFC') // Normalize Unicode
    .toLowerCase()    // Convert to lowercase
    .trim();

  // Replace common separators and some problematic characters with a single hyphen
  cleaned = cleaned.replace(/[\s_,\.;!\?"'\(\)\[\]\{\}&*+%#@\^~\\\/<>]+/g, '-');

  // Keep Bengali characters, English letters, numbers, and hyphens. Remove others.
  // \u0980-\u09FF is the Unicode range for Bengali characters.
  cleaned = cleaned.replace(/[^\u0980-\u09FFa-z0-9-]/g, '');

  // Consolidate multiple hyphens into a single hyphen
  cleaned = cleaned.replace(/-+/g, '-');

  // Remove leading or trailing hyphens
  cleaned = cleaned.replace(/^-+|-+$/g, '');

  return cleaned || defaultVal.toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-');
}


/**
 * Cleans a string for display purposes.
 * Removes soft hyphens, zero-width spaces. Replaces hyphens surrounded by spaces with a single space.
 * Removes trailing parenthetical notes (e.g., " (Live)"). Trims and normalizes multiple spaces to one.
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
    // cleaned = cleaned.replace(/\s+-\s+/g, ' '); // Hyphens surrounded by spaces become a single space - this might be too aggressive for some names
    cleaned = cleaned.replace(/\s*\([^)]*\)\s*$/, ''); // Remove trailing parenthetical notes like (Live), (Remix)
    cleaned = cleaned.trim().replace(/\s+/g, ' '); // Trim and normalize multiple spaces to one

    // Specific problematic character sequence removals or replacements related to Bengali
    cleaned = cleaned.replace(/Ç/g, 'চ'); // Example: Correct specific mistyped characters if known

    if (cleaned === "" || cleaned === "ঃ" || cleaned === ":" || cleaned === "-" || cleaned === "undefined") {
        return undefined;
    }

    // Filter out strings that are only Bengali diacritics or isolated problematic characters
    if (cleaned.length === 1 && /^[\u0981-\u0983\u09BE-\u09C4\u09C7-\u09C8\u09CB-\u09CC\u09D7\u09BC\u09CD]$/.test(cleaned)) {
        return undefined;
    }
    // Avoid strings starting with a lone halant (common cleaning artifact)
    if (cleaned.startsWith('\u09CD')) return undefined;


    // Correct common misspellings or alternative forms for display
    const corrections: { [key: string]: string } = {
        'কাজী নজরুল ইসলম': 'কাজী নজরুল ইসলাম',
        'দ্বিজেন্দ্রলাল রয়': 'দ্বিজেন্দ্রলাল রায়',
        'আর ডি বর্মন': 'রাহুল দেববর্মণ',
        'আর. ডি. বর্মন': 'রাহুল দেববর্মণ',
        // 'বিভিন্ন বাউল': 'বিভিন্ন শিল্পী', // This is handled in the data processing step
        'সংগৃহিত': 'সংগৃহীত',
        'নিরেন্দ্রনাথ চক্রবর্তী': 'নীরেন্দ্রনাথ চক্রবর্তী',
        // 'অজানা': 'অজানা', // This might be too broad if "অজানা" is genuinely part of a name
        'অজানা গীতিকার': 'অজানা গীতিকার',
        'অজানা শিল্পী': 'অজানা শিল্পী',
        'অজানা সুরকার': 'অজানা সুরকার',
        'অজানা ধরণ': 'অজানা ধরণ',
        'মাহমুদুজ্জামান বাবু': 'মাহমুদুজ্জামান বাবু',
    };

    if (corrections[cleaned]) {
        cleaned = corrections[cleaned];
    }
    
    const problematicFragments = ["িন্দু", "ঁভূল", "িভিয়", "ঃ", ":", "-", "undefined"];
    if (problematicFragments.some(fragment => cleaned === fragment)) {
        return undefined;
    }

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

  cleanedText = cleanedText.replace(/\r\n/g, '\n'); // Normalize CRLF to LF

  // Preserve multiple newlines correctly by first marking them
  const newlinePlaceholder = '___NEWLINE_PLACEHOLDER___';
  cleanedText = cleanedText.replace(/\n(\s*\n)+/g, (match) => {
    const newlineCount = (match.match(/\n/g) || []).length;
    return `\n${newlinePlaceholder.repeat(newlineCount - 1)}\n`;
  });
  
  cleanedText = cleanedText
    .split('\n')
    .map(line => line
        .replace(/[ \t]+/g, ' ') // Normalize horizontal spacing to single space
        .trim() // Trim leading/trailing spaces from each line
    )
    .join('\n');

  // Restore multiple newlines
  cleanedText = cleanedText.replace(new RegExp(newlinePlaceholder, 'g'), '\n');

  // Remove spaces at the beginning of a line if they somehow re-appeared or were part of placeholder logic
  cleanedText = cleanedText.replace(/^\s+/gm, '');

  // Remove isolated hyphens on a line if they are the only content of the line
  // And remove lines that are just "---" or similar
  cleanedText = cleanedText.split('\n').map(line => {
    const trimmedLine = line.trim();
    if (trimmedLine === '-' || trimmedLine.match(/^--+$/)) {
      return '';
    }
    return line; // Keep original line if not just hyphens
  }).join('\n');


  // Final trim of the whole block
  cleanedText = cleanedText.trim();

  // Ensure lines are not just whitespace and filter out empty lines that might result from cleaning
  cleanedText = cleanedText.split('\n').filter(line => line.trim().length > 0).join('\n');


  return cleanedText || 'গানের কথা পাওয়া যায়নি';
}

/**
 * Creates a URL-friendly slug. For debugging, it will now ONLY use the uniqueId.
 * @param title The song title (original) - currently unused for slug.
 * @param artist The song artist (original) - currently unused for slug.
 * @param uniqueId A unique identifier for the song (string or number).
 * @returns A string suitable for use in a URL path segment, already lowercased.
 */
export const createSlug = (title?: string, artist?: string, uniqueId?: string | number): string => {
  // For debugging purposes, the slug will ONLY be the string representation of uniqueId, lowercased.
  // This bypasses any issues with cleaning title/artist strings for slug generation.
  const idStr = String(uniqueId || `fallback-id-${Date.now()}`);
  return idStr.toLowerCase();
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
