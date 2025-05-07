
'use client';

import * as React from 'react';
import SongList from '@/components/song-list';
import { getPaginatedSongs, getTotalSongCount } from '@/services/bangla-song-database';
import type { Song } from '@/types/song';
import { Separator } from '@/components/ui/separator';
import { ListMusic } from 'lucide-react';
import PaginationControls from '@/components/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

const SONGS_PER_PAGE = 48;

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
  const [lastDoc, setLastDoc] = React.useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  // Store cursors for each page to enable going back
  const [pageCursors, setPageCursors] = React.useState<(QueryDocumentSnapshot<DocumentData> | null)[]>([null]);


  React.useEffect(() => {
    async function fetchTotalCount() {
      try {
        const totalCount = await getTotalSongCount();
        setTotalPages(Math.ceil(totalCount / SONGS_PER_PAGE));
      } catch (err) {
        console.error('Error fetching total song count:', err);
        setError('মোট গানের সংখ্যা আনতে ব্যর্থ।');
        setTotalPages(0);
      }
    }
    fetchTotalCount();
  }, []);

  React.useEffect(() => {
    async function loadSongs() {
      if (totalPages === 0 && currentPage !== 1) return; 

      setLoading(true);
      setError(null);
      try {
        const pageToFetch = Math.max(1, Math.min(currentPage, totalPages || 1));
         if (pageToFetch !== currentPage && totalPages > 0) { // only correct if totalPages is known
            setCurrentPage(pageToFetch);
            return;
        }
        
        // Get the cursor for the previous page to start after
        const startAfterCursor = pageCursors[pageToFetch -1] || null;

        const { songs: paginatedSongs, nextPageCursor } = await getPaginatedSongs(pageToFetch, SONGS_PER_PAGE, startAfterCursor);
        setSongs(paginatedSongs);
        
        if (nextPageCursor) {
            // Store cursor for the next page
            setPageCursors(prevCursors => {
                const newCursors = [...prevCursors];
                newCursors[pageToFetch] = nextPageCursor; // nextPageCursor is for the *start* of the *next* page
                return newCursors;
            });
        }
        setLastDoc(nextPageCursor);

      } catch (err) {
        console.error(`Error fetching songs for page ${currentPage}:`, err);
        setError('গানগুলি আনতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।');
        setSongs([]);
      } finally {
        setLoading(false);
      }
    }
    if (totalPages > 0 || currentPage === 1) { // Fetch if totalPages is known or it's the first page
        loadSongs();
    }
  }, [currentPage, totalPages]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && (totalPages === 0 || newPage <= totalPages)) {
        setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <ListMusic className="w-7 h-7" />
          <span>সকল গান</span>
        </h1>
        {!loading && totalPages > 0 && (
           <span className="text-sm text-muted-foreground">
              পৃষ্ঠা {toBengaliNumerals(currentPage)} / {toBengaliNumerals(totalPages)}
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

      {!loading && !error && songs.length === 0 && totalPages > 0 && currentPage > 0 && (
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
          isLoading={loading}
        />
      )}
    </div>
  );
}
