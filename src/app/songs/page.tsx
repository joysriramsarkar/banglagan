

'use client';

import * as React from 'react';
import SongList from '@/components/song-list';
import { getPaginatedSongs, getTotalSongCount } from '@/services/bangla-song-database';
import type { Song } from '@/types/song';
import { Separator } from '@/components/ui/separator';
import { ListMusic, WifiOff } from 'lucide-react';
import PaginationControls from '@/components/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { toBengaliNumerals } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


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
  // pageCursors stores the *starting* document of each page. pageCursors[0] is null (for page 1).
  // pageCursors[i] is the document to start *after* for page i+1.
  const [pageStartCursors, setPageStartCursors] = React.useState<(QueryDocumentSnapshot<DocumentData> | null)[]>([null]);


  React.useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);
      setError(null);
      try {
        const totalCount = await getTotalSongCount();
        const calculatedTotalPages = Math.ceil(totalCount / SONGS_PER_PAGE);
        setTotalPages(calculatedTotalPages);

        if (calculatedTotalPages > 0) {
          const { songs: initialSongs, nextPageCursor } = await getPaginatedSongs(1, SONGS_PER_PAGE, null);
          setSongs(initialSongs);
          if (nextPageCursor) {
            setPageStartCursors(prev => {
              const newCursors = [...prev];
              newCursors[1] = nextPageCursor; // Cursor for the start of page 2
              return newCursors;
            });
          }
        } else {
          setSongs([]);
        }
      } catch (err: any) {
        console.error('Error fetching initial song data:', err);
        if (err.message?.toLowerCase().includes('offline') || err.code === 'unavailable') {
             setError("গানগুলি লোড করা যায়নি কারণ আপনি অফলাইনে আছেন বা সার্ভারের সাথে সংযোগ করতে পারছেন না।");
        } else {
            setError('মোট গানের সংখ্যা আনতে ব্যর্থ।');
        }
        setTotalPages(0);
        setSongs([]);
      } finally {
        setLoading(false);
      }
    }
    fetchInitialData();
  }, []); // Runs once on mount

  React.useEffect(() => {
    async function loadSongsForPage() {
      if (currentPage === 1 || totalPages === 0) return; // Initial load handled by previous useEffect or no pages

      setLoading(true);
      setError(null);
      try {
        // Get the cursor for the previous page to start after
        const startAfterCursor = pageStartCursors[currentPage - 1] || null;
        
        const { songs: paginatedSongs, nextPageCursor } = await getPaginatedSongs(currentPage, SONGS_PER_PAGE, startAfterCursor);
        setSongs(paginatedSongs);
        
        if (nextPageCursor) {
            setPageStartCursors(prevCursors => {
                const newCursors = [...prevCursors];
                newCursors[currentPage] = nextPageCursor; // Cursor for the start of page currentPage + 1
                return newCursors;
            });
        }
      } catch (err: any) {
        console.error(`Error fetching songs for page ${currentPage}:`, err);
        if (err.message?.toLowerCase().includes('offline') || err.code === 'unavailable') {
             setError("গানগুলি লোড করা যায়নি কারণ আপনি অফলাইনে আছেন বা সার্ভারের সাথে সংযোগ করতে পারছেন না।");
        } else {
           setError('গানগুলি আনতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।');
        }
        setSongs([]);
      } finally {
        setLoading(false);
      }
    }
    
    if (currentPage > 1 && totalPages > 0) {
        loadSongsForPage();
    }
  }, [currentPage, totalPages, pageStartCursors]); // Rerun if currentPage or totalPages changes (after initial)

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && (totalPages === 0 || newPage <= totalPages) && newPage !== currentPage) {
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
        <Alert variant="destructive" className="mt-4">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>ত্রুটি</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && songs.length > 0 && (
        <SongList songs={songs} />
      )}

      {!loading && !error && songs.length === 0 && totalPages > 0 && currentPage > 0 && (
         <p className="text-muted-foreground text-center py-4">এই পৃষ্ঠায় কোনো গান পাওয়া যায়নি।</p>
      )}
      
      {!loading && !error && songs.length === 0 && totalPages === 0 && !error && (
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

