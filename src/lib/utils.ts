
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Cleans a string for use in slugs. Converts to lowercase,
 * replaces spaces and multiple hyphens with a single hyphen,
 * removes characters other than Bengali, Latin alphanumeric, and hyphens.
 * Removes leading/trailing hyphens.
 * Ensures NFC normalization and converts to lowercase.
 * Specifically targets Bengali characters using their Unicode range.
 * Returns a default string if the input is invalid or cleaning results in an empty string.
 * @param str The string to clean.
 * @param defaultVal The default string to return if cleaning fails or input is invalid.
 * @returns The cleaned string, suitable for slugs, or the defaultVal.
 */
export function cleanString(str: string | undefined | null, defaultVal: string = 'unknown'): string {
  if (!str || typeof str !== 'string' || !str.trim()) {
    return defaultVal.toLowerCase();
  }

  let cleaned = str
    .normalize('NFC') // Normalize Unicode
    .toLowerCase()    // Convert to lowercase FIRST
    .trim();

  // Replace spaces and common separators with hyphens.
  // Also replace other problematic characters that might not be caught by the next regex.
  cleaned = cleaned.replace(/[\s_.,;!?"'()[\]{}&*+%$#@^~`=|\\/<>\u200B-\u200D\uFEFF\u00AD]+/g, '-');

  // Allow Bengali (\u0980-\u09FF), Latin alphanumeric (a-z0-9), and hyphens (-).
  // Remove any character NOT in this set by replacing it with an empty string.
  cleaned = cleaned.replace(/[^\u0980-\u09FFa-z0-9-]/g, '');

  // Replace multiple hyphens with a single hyphen
  cleaned = cleaned.replace(/-+/g, '-');
  // Remove leading/trailing hyphens
  cleaned = cleaned.replace(/^-+|-+$/g, '');

  return cleaned === "" ? defaultVal.toLowerCase() : cleaned;
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
    cleaned = cleaned.replace(/\s+-\s+/g, ' '); // Hyphens surrounded by spaces become a single space
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
        'বিভিন্ন বাউল': 'বিভিন্ন শিল্পী',
        'সংগৃহিত': 'সংগৃহীত',
        'অজানা': 'অজানা',
        'অজানা গীতিকার': 'অজানা গীতিকার',
        'অজানা শিল্পী': 'অজানা শিল্পী',
        'অজানা সুরকার': 'অজানা সুরকার',
        'অজানা ধরণ': 'অজানা ধরণ',
        'মাহমুদুজ্জামান বাবু': 'মাহমুদুজ্জামান বাবু',
        'নচিকেতা': 'নচিকেতা চক্রবর্তী',
        // Keep 'নিরেন্দ্রনাথ চক্রবর্তী' as is, it will be handled by deduplication preference if both exist.
        // 'নিরেন্দ্রনাথ চক্রবর্তী': 'নীরেন্দ্রনাথ চক্রবর্তী' 
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
  cleanedText = cleanedText.split('\n').map(line => line.trim() === '-' ? '' : line).join('\n');

  // Final trim of the whole block
  cleanedText = cleanedText.trim();

  // Ensure lines are not just whitespace and filter out empty lines that might result from cleaning
  cleanedText = cleanedText.split('\n').filter(line => line.trim().length > 0).join('\n');


  return cleanedText || 'গানের কথা পাওয়া যায়নি';
}

/**
 * Creates a URL-friendly slug from a song title, artist, and a unique ID.
 * Uses the `cleanString` function for each part. All parts are joined by hyphens.
 * Slug format: title-artist-id
 * @param title The song title (original).
 * @param artist The song artist (original).
 * @param uniqueId A unique identifier for the song (string or number).
 * @returns A string suitable for use in a URL path segment, already lowercased.
 */
export const createSlug = (title?: string, artist?: string, uniqueId?: string | number): string => {
  // Use original values and let cleanString handle them.
  // Default values ensure cleanString doesn't fail on undefined/null.
  const titleSlug = cleanString(title, 'untitled');
  const artistSlug = cleanString(artist, 'unknown-artist');
  // ID should always be present and cleanable. Convert to string.
  // Use a timestamp-based fallback for ID if it's somehow still invalid after cleaning.
  const idSlug = cleanString(String(uniqueId), `id-${Date.now()}`);

  // Simpler slug structure: title-artist-id
  const slugParts = [titleSlug, artistSlug, idSlug];
  let finalSlug = slugParts.join('-');

  // This final replace might be redundant if cleanString handles it well, but it's safe.
  finalSlug = finalSlug.replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  
  // Ensure a final slug always exists and is not empty
  return finalSlug || `song-${idSlug}`; // finalSlug will already be lowercase from cleanString
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
