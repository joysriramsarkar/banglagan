'use client';

import * as React from 'react';
import SongList from '@/components/song-list';
import { getPaginatedSongs, getTotalSongCount } from '@/services/bangla-song-database';
import type { Song } from '@/types/song';
import { Separator } from '@/components/ui/separator';
import { ListMusic, WifiOff } from 'lucide-react';
import PaginationControls from '@/components/pagination';
import { Skeleton } from '@/components/ui/skeleton';
// QueryDocumentSnapshot and DocumentData are Firebase specific, not needed for mock
// import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'; 
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
  // Cursors are not needed for simple mock pagination
  // const [pageStartCursors, setPageStartCursors] = React.useState<(QueryDocumentSnapshot<DocumentData> | null)[]>([null]);


  React.useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);
      setError(null);
      try {
        const totalCount = await getTotalSongCount(); // Calls mock service
        const calculatedTotalPages = Math.ceil(totalCount / SONGS_PER_PAGE);
        setTotalPages(calculatedTotalPages);

        if (calculatedTotalPages > 0) {
          // Fetch the first page using mock pagination logic
          const { songs: initialSongs } = await getPaginatedSongs(1, SONGS_PER_PAGE); // Calls mock service
          setSongs(initialSongs || []);
        } else {
          setSongs([]);
        }
      } catch (err: any) {
        console.error('Error fetching initial song data (mock):', err);
        setError('গানগুলি লোড করতে ব্যর্থ। অনুগ্রহ করে পৃষ্ঠাটি রিফ্রেশ করুন।');
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
      if (currentPage === 1 || totalPages === 0) return; // Initial load handled or no pages

      setLoading(true);
      setError(null);
      try {
        // Fetch the current page using mock pagination logic
        const { songs: paginatedSongs } = await getPaginatedSongs(currentPage, SONGS_PER_PAGE); // Calls mock service
        setSongs(paginatedSongs || []);
        
      } catch (err: any) {
        console.error(`Error fetching songs for page ${currentPage} (mock):`, err);
        setError('গানগুলি আনতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।');
        setSongs([]); // Clear songs on error
      } finally {
        setLoading(false);
      }
    }
    
    // Only load if not the first page (which was handled in initial load)
    if (currentPage > 1) {
        loadSongsForPage();
    } else if (currentPage === 1 && totalPages > 0 && songs.length === 0 && !loading && !error) {
        // If we somehow ended up on page 1 with no songs after initial load, try loading again.
        loadSongsForPage(); 
    }
    
  }, [currentPage, totalPages]); // Rerun if currentPage or totalPages changes (after initial)

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && (totalPages === 0 || newPage <= totalPages) && newPage !== currentPage) {
        setCurrentPage(newPage);
        // Scroll to top when page changes for better UX
        window.scrollTo(0, 0); 
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
