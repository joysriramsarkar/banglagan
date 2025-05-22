
// src/app/sitemap.ts
import type { MetadataRoute } from 'next';
import { getAllSongs, getAllArtists, getAllGenres, getAllLyricists, getAllComposers } from '@/services/bangla-song-database'; // Assuming these functions exist and return appropriate data for sitemap
import { createSlug, cleanDisplayString } from '@/lib/utils';

// IMPORTANT: Replace this with your actual domain
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://studio--banglagan.us-central1.hosted.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/songs`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/artists`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/genres`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/lyricists`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/composers`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // Dynamic song pages
  let songEntries: MetadataRoute.Sitemap = [];
  try {
    const songs = await getAllSongs(); // This should fetch all songs, including placeholders if any
    songEntries = songs
      .filter(song => song.slug && song.genre !== 'Placeholder') // Ensure slug exists and it's not a placeholder song
      .map((song) => ({
        url: `${BASE_URL}/song/${encodeURIComponent(song.slug)}`,
        lastModified: currentDate, // Or use song.updatedAt if available
        changeFrequency: 'monthly',
        priority: 0.6,
      }));
  } catch (error) {
    console.error("Error fetching songs for sitemap:", error);
  }

  // Optional: Dynamic search pages for artists, genres, lyricists if desired
  // This can create a very large sitemap if you have many items.
  // Consider if this is necessary or if the main listing pages are sufficient.

  /*
  // Example for artists - similar logic for genres and lyricists
  let artistSearchEntries: MetadataRoute.Sitemap = [];
  try {
    const artists = await getAllArtists();
    artistSearchEntries = artists.map((artist) => {
      const cleanedArtist = cleanDisplayString(artist);
      if (!cleanedArtist) return null;
      return {
        url: `${BASE_URL}/search?q=${encodeURIComponent(cleanedArtist)}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.5,
      };
    }).filter(Boolean) as MetadataRoute.Sitemap;
  } catch (error) {
    console.error("Error fetching artists for sitemap:", error);
  }
  */
  
  // Combine all entries
  // return [...staticPages, ...songEntries, ...artistSearchEntries, ...genreSearchEntries, ...lyricistSearchEntries];
  return [...staticPages, ...songEntries];
}
