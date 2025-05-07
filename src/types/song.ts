
import type { Timestamp } from 'firebase/firestore';

/**
 * Represents a song with title, artist, album, genre, release year, lyricist, and lyrics.
 */
export interface Song {
  id?: string; // Firestore document ID
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
   * The album the song belongs to (optional).
   * অ্যালবামের নাম (যদি থাকে)।
   */
  album?: string;
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
   * URL-friendly slug for the song.
   */
  slug?: string;
  /**
   * Keywords for searching.
   */
  keywords?: string[];
  /**
   * Timestamp of when the song was added/created in Firestore.
   */
  createdAt?: Timestamp;
  /**
   * For client-side ranking during search.
   */
  matchCount?: number;
}
