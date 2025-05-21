
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
          // Use song.slug as it's guaranteed to be unique (includes ID)
          // or fallback to song.id if slug is somehow not available (though it should be)
          const key = song.slug || song.id || `${song.title}-${song.artist}-${index}`;
          return <SongCard key={key} song={song} />;
        })}
      </div>
    </div>
  );
}
