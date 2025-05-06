import type { Song } from '@/services/bangla-song-database';
import SongCard from '@/components/song-card';
import { createSlug, cleanString } from '@/lib/utils'; // Import createSlug and cleanString

interface SongListProps {
  songs: Song[];
  title?: string;
}

export default function SongList({ songs, title }: SongListProps) {
  if (!songs || songs.length === 0) {
    return (
      <div>
        {title && <h2 className="text-2xl font-semibold mb-4 text-primary">{title}</h2>}
        <p className="text-muted-foreground">কোন গান পাওয়া যায়নি।</p>
      </div>
    );
  }

  return (
    <div>
      {title && <h2 className="text-2xl font-semibold mb-4 text-primary">{title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {songs.map((song, index) => {
          // Clean properties before generating key parts
          const cleanTitle = cleanString(song.title) || 'untitled';
          const cleanArtist = cleanString(song.artist) || 'unknown-artist';
          const cleanLyricist = cleanString(song.lyricist);

          // Use createSlug for a more unique key, falling back to index if slug parts are missing
          // Appending index ensures uniqueness even if createSlug somehow produces identical slugs for different songs
          const key = `${createSlug(cleanTitle, cleanArtist, cleanLyricist)}-${index}`;
          return <SongCard key={key} song={song} />;
        })}
      </div>
    </div>
  );
}

