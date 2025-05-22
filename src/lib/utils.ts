
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
 * @param str The string to clean.
 * @returns The cleaned string, suitable for slugs, or undefined if input is invalid/empty.
 */
export function cleanString(str: string | undefined | null): string | undefined {
  if (!str || typeof str !== 'string' || !str.trim()) {
    return undefined;
  }

  let cleaned = str
    .normalize('NFC') // Normalize Unicode characters
    .toLowerCase()    // Convert to lowercase
    // Allow Bengali letters, Latin letters, numbers, and hyphens. Replace others.
    // \p{L} matches any kind of letter from any language.
    // \p{N} matches any kind of numeric character in any script.
    .replace(/[^\p{L}\p{N}0-9-]+/gu, '-') // Replace non-alphanumeric (excluding hyphen) with hyphen
    .replace(/-+/g, '-')                // Replace multiple hyphens with a single hyphen
    .replace(/^-+|-+$/g, '');           // Remove leading and trailing hyphens

  // Specific fix for "মাহমুদুজ্জামান বাবু" if general regex fails for "বাবু" part
  // This is a common troublesome case.
  if (cleaned.includes('মাহমুদুজ্জামান-া-ু')) {
    cleaned = cleaned.replace('মাহমুদুজ্জামান-া-ু', 'মাহমুদুজ্জামান-বাবু');
  }
   if (cleaned.includes('মাহমুদুজ্জামান-বabu')) {
    cleaned = cleaned.replace('মাহমুদুজ্জামান-বabu', 'মাহমুদুজ্জামান-বাবু');
  }


  return cleaned === "" ? undefined : cleaned;
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

    if (cleaned === "" || cleaned === "ঃ" || cleaned === ":" || cleaned === "-" || cleaned === "undefined") {
        return undefined;
    }

    if (cleaned.length === 1 && /^[\u0981-\u0983\u09BE-\u09C4\u09C7-\u09C8\u09CB-\u09CC\u09D7\u09BC\u09CD]$/.test(cleaned)) {
        return undefined;
    }
    if (cleaned.startsWith('\u09CD')) return undefined;

    const problematicFragments = ["িন্দু", "ঁভূল", "িভিয়"];
    if (problematicFragments.includes(cleaned)) return undefined;

    if (cleaned === 'কাজী নজরুল ইসলম') cleaned = 'কাজী নজরুল ইসলাম';
    if (cleaned === 'দ্বিজেন্দ্রলাল রয়') cleaned = 'দ্বিজেন্দ্রলাল রায়';
    if (cleaned === 'আর ডি বর্মন') cleaned = 'রাহুল দেববর্মণ';
    if (cleaned === 'আর. ডি. বর্মন') cleaned = 'রাহুল দেববর্মণ';
    if (cleaned === 'বিভিন্ন বাউল') cleaned = 'বিভিন্ন শিল্পী';


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

  // Preserve multiple newlines correctly
  const newlinePlaceholder = '___NEWLINE_PLACEHOLDER___';
  cleanedText = cleanedText.replace(/\n{2,}/g, `\n${newlinePlaceholder}\n`);

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

  // Ensure lines are not just whitespace
  cleanedText = cleanedText.split('\n').filter(line => line.trim().length > 0).join('\n');


  return cleanedText || 'গানের কথা পাওয়া যায়নি';
}

/**
 * Creates a URL-friendly slug from a song title, artist, lyricist, and a unique ID.
 * Uses the `cleanString` function for each part.
 * @param title The song title.
 * @param artist The song artist.
 * @param lyricist The song lyricist.
 * @param uniqueId A unique identifier for the song.
 * @returns A string suitable for use in a URL path segment.
 */
export const createSlug = (title?: string, artist?: string, lyricist?: string, uniqueId?: string | number): string => {
  const titleSlug = cleanString(title) || ' शीर्षकहीन'; // শিরোনামহীন in Hindi, change to Bengali if needed
  const artistSlug = cleanString(artist) || 'অজানা-শিল্পী';
  const lyricistSlug = cleanString(lyricist) || 'অজানা-গীতিকার'; // Default if lyricist is undefined/empty
  const idSlug = cleanString(String(uniqueId)) || 'id'; // Ensure uniqueId is a string and cleaned

  // Construct slug: title-artist-lyricist-id
  // Filter out undefined/empty parts before joining, though defaults should prevent this.
  const slugParts = [titleSlug, artistSlug, lyricistSlug, idSlug].filter(Boolean);
  let finalSlug = slugParts.join('-');

  // Second pass to ensure no double hyphens from joining empty/undefined cleaned parts
  finalSlug = finalSlug.replace(/-+/g, '-').replace(/^-+|-+$/g, '');

  return finalSlug || 'unknown-song'; // Fallback if all parts are empty
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
