
import type { Song } from '@/services/bangla-song-database';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music, User, Feather } from 'lucide-react'; // Added Feather icon
import { createSlug } from '@/lib/utils'; // Import from utils

interface SongCardProps {
  // Update to use the full Song type
  song: Song;
}

// Helper function to clean strings for display (less aggressive than for slugs)
// Keeps spaces, removes only problematic chars, trims.
function cleanDisplayString(str: string | undefined | null): string | undefined {
    if (!str || typeof str !== 'string' || !str.trim()) {
        return undefined;
    }
    return str
        .replace(/\u00AD/g, '') // Remove soft hyphens
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces
        .trim()
        .replace(/\s+/g, ' '); // Normalize multiple spaces to one
}


export default function SongCard({ song }: SongCardProps) {
  // Clean properties for display using cleanDisplayString
  const displayTitle = cleanDisplayString(song.title) || 'শিরোনামহীন';
  const displayArtist = cleanDisplayString(song.artist) || 'অজানা শিল্পী';
  const displayLyricist = cleanDisplayString(song.lyricist);

  // Slug generation still uses the original song properties,
  // as createSlug handles its own internal cleaning for URL safety.
  const slug = createSlug(song.title, song.artist, song.lyricist);


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
