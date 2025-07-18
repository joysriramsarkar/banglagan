
import type { Song } from '@/services/bangla-song-database';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music, User, Feather, Disc3 } from 'lucide-react'; // Added Disc3 for composer
import { cleanDisplayString } from '@/lib/utils';

interface SongCardProps {
  song: Song;
}

export default function SongCard({ song }: SongCardProps) {
  const rawDisplayTitle = cleanDisplayString(song.title) || 'শিরোনামহীন';
  const displayTitle = rawDisplayTitle.replace(/-/g, ' ');
  const displayArtist = cleanDisplayString(song.artist) || 'অজানা শিল্পী';
  const displayLyricist = cleanDisplayString(song.lyricist);
  const displayComposer = cleanDisplayString(song.composer);


  const encodedSlug = encodeURIComponent(song.slug);


  return (
    <Link href={`/song/${encodedSlug}`} className="block hover:shadow-lg transition-shadow duration-200 rounded-lg">
      <Card className="h-full bg-card hover:bg-secondary/80 cursor-pointer transition-colors duration-200">
        <CardHeader className="pb-3 pt-4 px-4">
           <div className="flex items-center gap-2 mb-1">
              <Music className="w-4 h-4 text-primary flex-shrink-0" />
              <CardTitle className="text-base leading-tight font-medium">{displayTitle}</CardTitle>
           </div>
           <CardDescription className="text-xs text-muted-foreground space-y-0.5 pl-6">
              <div className="flex items-center gap-1">
                  <User className="w-3 h-3 flex-shrink-0" />
                  <span>{displayArtist}</span>
              </div>
              {displayLyricist && displayLyricist !== 'অজানা গীতিকার' && (
                  <div className="flex items-center gap-1">
                      <Feather className="w-3 h-3 flex-shrink-0" />
                      <span>{displayLyricist}</span>
                  </div>
              )}
              {displayComposer && displayComposer !== 'অজানা সুরকার' && (
                  <div className="flex items-center gap-1">
                      <Disc3 className="w-3 h-3 flex-shrink-0" />
                      <span>{displayComposer}</span>
                  </div>
              )}
           </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
