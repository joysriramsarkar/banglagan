import type { Song } from '@/services/bangla-song-database';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music, User, Feather } from 'lucide-react'; // Added Feather icon
import { createSlug, cleanString } from '@/lib/utils'; // Import from utils

interface SongCardProps {
  // Update to use the full Song type
  song: Song;
}


export default function SongCard({ song }: SongCardProps) {
  // Clean properties before use for display and slug generation
  const displayTitle = cleanString(song.title) || 'শিরোনামহীন';
  const displayArtist = cleanString(song.artist) || 'অজানা শিল্পী';
  const displayLyricist = cleanString(song.lyricist); // cleanString handles undefined

  // Generate slug using cleaned properties
  const slug = createSlug(displayTitle, displayArtist, displayLyricist);


  return (
    <Link href={`/song/${encodeURIComponent(slug)}`} passHref legacyBehavior>
      <a className="block hover:shadow-lg transition-shadow duration-200 rounded-lg">
        <Card className="h-full bg-card hover:bg-secondary/80 cursor-pointer transition-colors duration-200">
          <CardHeader className="pb-2">
             <div className="flex items-center gap-3 mb-1">
                <Music className="w-5 h-5 text-primary flex-shrink-0" />
                <CardTitle className="text-lg leading-tight">{displayTitle}</CardTitle>
             </div>
             <CardDescription className="text-sm text-muted-foreground space-y-0.5 pl-8"> {/* Indent description */}
                <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{displayArtist}</span>
                </div>
                {/* Conditionally display lyricist if available and not generic */}
                {displayLyricist && displayLyricist !== 'সংগৃহীত' && displayLyricist !== 'অজানা গীতিকার' && (
                    <div className="flex items-center gap-1.5">
                        <Feather className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{displayLyricist}</span>
                    </div>
                )}
             </CardDescription>
          </CardHeader>
          {/* Removed lyrics preview for cleaner card */}
        </Card>
      </a>
    </Link>
  );
}
