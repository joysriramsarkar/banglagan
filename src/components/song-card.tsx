import type { Song } from '@/services/bangla-song-database';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music } from 'lucide-react';

interface SongCardProps {
  // Update to use the full Song type, but only display title/artist
  song: Song;
}

// Helper function to create slugs (consider moving to a utility file)
// Handles basic replacement, might need more robust logic for complex names
// Preserves Bengali characters but replaces spaces and removes unsafe chars.
const createSlug = (title: string, artist: string) => {
  // Keep letters, numbers, spaces, hyphens. Remove others. Replace spaces with hyphens.
  const titleSlug = title.toLowerCase()
                       .replace(/[^\p{L}\p{N}\s-]/gu, '') // Keep Unicode letters, numbers, space, hyphen
                       .trim()
                       .replace(/\s+/g, '-'); // Replace spaces with hyphens
  const artistSlug = artist.toLowerCase()
                         .replace(/[^\p{L}\p{N}\s-]/gu, '')
                         .trim()
                         .replace(/\s+/g, '-');

  // Ensure slugs are not empty and URL-safe (though full URL encoding is handled by Link/browser)
  const safeTitleSlug = titleSlug || 'untitled';
  const safeArtistSlug = artistSlug || 'unknown-artist';

  // Combine with a separator
  return `${safeTitleSlug}-by-${safeArtistSlug}`;
};


export default function SongCard({ song }: SongCardProps) {

  const slug = createSlug(song.title, song.artist);

  return (
    <Link href={`/song/${encodeURIComponent(slug)}`} passHref legacyBehavior>
      <a className="block hover:shadow-lg transition-shadow duration-200 rounded-lg">
        <Card className="h-full bg-card hover:bg-secondary/80 cursor-pointer transition-colors duration-200">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
             <Music className="w-6 h-6 text-primary" />
             <div className="grid gap-1">
               <CardTitle className="text-lg">{song.title}</CardTitle>
               <CardDescription>{song.artist}</CardDescription>
             </div>
          </CardHeader>
          {/* Removed lyrics preview for cleaner card */}
        </Card>
      </a>
    </Link>
  );
}
