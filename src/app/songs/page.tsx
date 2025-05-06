import SongList from '@/components/song-list';
import { getAllSongs } from '@/services/bangla-song-database';
import { Separator } from '@/components/ui/separator';
import { ListMusic } from 'lucide-react';

export default async function AllSongsPage() {
  const allSongs = await getAllSongs();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
        <ListMusic className="w-7 h-7" />
        <span>সকল গান</span>
      </h1>
      <Separator />
      {allSongs.length > 0 ? (
         <SongList songs={allSongs} />
      ) : (
         <p className="text-muted-foreground">কোনো গান পাওয়া যায়নি।</p>
      )}
    </div>
  );
}

// Optional: Add metadata
export const metadata = {
  title: 'সকল গান - বাংলা গান',
  description: 'সকল বাংলা গানের তালিকা ব্রাউজ করুন।',
};
