import type { Song } from '@/services/bangla-song-database';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music } from 'lucide-react';

interface SongCardProps {
  song: Omit<Song, 'lyrics'>; // Only need title and artist for the card
}

export default function SongCard({ song }: SongCardProps) {
  // Basic slug function (replace with a more robust one if needed)
  const createSlug = (title: string, artist: string) => {
    return `${title.toLowerCase().replace(/\s+/g, '-')}-by-${artist.toLowerCase().replace(/\s+/g, '-')}`;
  };

  const slug = createSlug(song.title, song.artist);

  return (
    <Link href={`/song/${slug}`} passHref legacyBehavior>
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
