import type { Song } from '@/services/bangla-song-database';
import SongCard from '@/components/song-card';

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
        {songs.map((song) => (
          // Use artist and title combination as key, assuming it's unique enough for this context
          <SongCard key={`${song.artist}-${song.title}`} song={song} />
        ))}
      </div>
    </div>
  );
}
