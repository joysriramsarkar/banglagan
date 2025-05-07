
import type { Song } from '@/services/bangla-song-database';
import SongCard from '@/components/song-card';
import { createSlug } from '@/lib/utils'; // Import createSlug

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
          // Use createSlug with original properties for a more unique key, 
          // as createSlug handles its own cleaning.
          // Appending index ensures uniqueness even if createSlug somehow produces 
          // identical slugs for different songs (e.g. same title, artist, lyricist if that's possible).
          const keyPart = createSlug(song.title, song.artist, song.lyricist) || `${song.title}-${song.artist}`;
          const key = `${keyPart}-${index}`;
          return <SongCard key={key} song={song} />;
        })}
      </div>
    </div>
  );
}
