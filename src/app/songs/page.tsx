'use client';

import * as React from 'react';
import SongList from '@/components/song-list';
import { getPaginatedSongs, getTotalSongCount, type Song } from '@/services/bangla-song-database';
import { Separator } from '@/components/ui/separator';
import { ListMusic, Loader2 } from 'lucide-react';
import PaginationControls from '@/components/pagination'; // Import the new PaginationControls component
import { Skeleton } from '@/components/ui/skeleton';

const SONGS_PER_PAGE = 48; // Increased number of songs per page

// Loading Skeleton for the Song List
function SongListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(SONGS_PER_PAGE)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="p-4 border rounded-lg space-y-2 bg-card">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export default function AllSongsPage() {
  const [songs, setSongs] = React.useState<Song[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchTotalCount() {
      try {
        const totalCount = await getTotalSongCount();
        setTotalPages(Math.ceil(totalCount / SONGS_PER_PAGE));
      } catch (err) {
        console.error('Error fetching total song count:', err);
        setError('মোট গানের সংখ্যা আনতে ব্যর্থ।');
        setTotalPages(0); // Set total pages to 0 on error
      }
    }
    fetchTotalCount();
  }, []); // Fetch total count only once on mount

  React.useEffect(() => {
    async function loadSongs() {
      if (totalPages === 0 && !error) return; // Don't fetch if totalPages hasn't been set yet (or error occurred)

      setLoading(true);
      setError(null); // Reset error before fetching
      try {
        // Ensure currentPage is within valid range
        const pageToFetch = Math.max(1, Math.min(currentPage, totalPages || 1));
        if (pageToFetch !== currentPage) {
            setCurrentPage(pageToFetch); // Correct the page if it was out of bounds
            return; // Fetch will trigger again due to currentPage change
        }

        const paginatedSongs = await getPaginatedSongs(pageToFetch, SONGS_PER_PAGE);
        setSongs(paginatedSongs);
      } catch (err) {
        console.error(`Error fetching songs for page ${currentPage}:`, err);
        setError('গানগুলি আনতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।');
        setSongs([]); // Clear songs on error
      } finally {
        setLoading(false);
      }
    }
    loadSongs();
  }, [currentPage, totalPages, error]); // Re-fetch when currentPage or totalPages changes, or if error is reset

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <ListMusic className="w-7 h-7" />
          <span>সকল গান</span>
        </h1>
        {!loading && totalPages > 1 && (
           <span className="text-sm text-muted-foreground">
              পৃষ্ঠা {currentPage} / {totalPages}
            </span>
        )}
      </div>
      <Separator />

      {loading && <SongListSkeleton />}

      {error && (
        <p className="text-destructive text-center py-4">{error}</p>
      )}

      {!loading && !error && songs.length > 0 && (
        <SongList songs={songs} />
      )}

      {!loading && !error && songs.length === 0 && totalPages > 0 && (
         <p className="text-muted-foreground text-center py-4">এই পৃষ্ঠায় কোনো গান পাওয়া যায়নি।</p>
      )}

      {!loading && !error && totalPages === 0 && !error && (
          <p className="text-muted-foreground text-center py-4">কোনো গান পাওয়া যায়নি।</p>
      )}


      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isLoading={loading} // Pass loading state
        />
      )}
    </div>
  );
}

// Remove metadata generation as this is now a client component
// export const metadata = { ... }
