import type { Timestamp } from 'firebase/firestore';

/**
 * Represents a song with title, artist, genre, release year, lyricist, and lyrics.
 */
export interface Song {
  /**
   * Unique identifier for the song (e.g., original array index or Firestore document ID).
   */
  id: string;
  /**
   * The title of the song in Bengali.
   * গানের শিরোনাম (বাংলায়)।
   */
  title: string;
  /**
   * The artist of the song in Bengali.
   * শিল্পীর নাম (বাংলায়)।
   */
  artist: string;
  /**
   * The lyricist of the song in Bengali (optional).
   * গীতিকারের নাম (বাংলায়, যদি থাকে)।
   */
  lyricist?: string;
  /**
   * The genre of the song (optional).
   * গানের ধরণ (যদি থাকে)।
   */
  genre?: string;
   /**
   * The release year of the song (optional).
   * প্রকাশের বছর (যদি থাকে)।
   */
  releaseYear?: number;
  /**
   * The lyrics of the song.
   * গানের কথা।
   */
  lyrics: string;
  /**
   * URL-friendly slug for the song, guaranteed to be present.
   */
  slug: string;
  /**
   * Keywords for searching (optional).
   */
  keywords?: string[];
  /**
   * Timestamp of when the song was added/created (optional, relevant for Firestore).
   */
  createdAt?: Timestamp;
  /**
   * For client-side ranking during search (optional).
   */
  matchCount?: number;
}
