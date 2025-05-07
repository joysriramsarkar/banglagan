
import type { Song } from '@/services/bangla-song-database';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music, User, Feather } from 'lucide-react';
import { createSlug, cleanDisplayString } from '@/lib/utils';

interface SongCardProps {
  song: Song;
}

export default function SongCard({ song }: SongCardProps) {
  const rawDisplayTitle = cleanDisplayString(song.title) || 'শিরোনামহীন';
  const displayTitle = rawDisplayTitle.replace(/-/g, ' ');
  const displayArtist = cleanDisplayString(song.artist) || 'অজানা শিল্পী';
  const displayLyricist = cleanDisplayString(song.lyricist);

  const slug = createSlug(song.title, song.artist, song.lyricist);


  return (
    <Link href={`/song/${encodeURIComponent(slug)}`} passHref legacyBehavior>
      <a className="block hover:shadow-lg transition-shadow duration-200 rounded-lg">
        <Card className="h-full bg-card hover:bg-secondary/80 cursor-pointer transition-colors duration-200">
          <CardHeader className="pb-3 pt-4 px-4"> {/* Adjusted padding */}
             <div className="flex items-center gap-2 mb-1"> {/* Reduced gap */}
                <Music className="w-4 h-4 text-primary flex-shrink-0" /> {/* Smaller icon */}
                <CardTitle className="text-base leading-tight font-medium">{displayTitle}</CardTitle> {/* Adjusted font size */}
             </div>
             <CardDescription className="text-xs text-muted-foreground space-y-0.5 pl-6"> {/* Indent & smaller text */}
                <div className="flex items-center gap-1"> {/* Reduced gap */}
                    <User className="w-3 h-3 flex-shrink-0" /> {/* Smaller icon */}
                    <span>{displayArtist}</span>
                </div>
                {displayLyricist && displayLyricist !== 'সংগৃহীত' && displayLyricist !== 'অজানা গীতিকার' && (
                    <div className="flex items-center gap-1"> {/* Reduced gap */}
                        <Feather className="w-3 h-3 flex-shrink-0" /> {/* Smaller icon */}
                        <span>{displayLyricist}</span>
                    </div>
                )}
             </CardDescription>
          </CardHeader>
          {/* Removed CardContent with lyrics preview */}
        </Card>
      </a>
    </Link>
  );
}
