'use client'; // Required for using useSearchParams

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { searchSongs, type Song } from '@/services/bangla-song-database';
import SongList from '@/components/song-list';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Frown } from 'lucide-react';

// Helper component for loading state
function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
        </div>
    )
}

function CardSkeleton() {
    return (
        <div className="p-4 border rounded-lg space-y-2 bg-card">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
    )
}


export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [songs, setSongs] = React.useState<Song[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!query) {
      setLoading(false);
      setSongs([]);
      return;
    }

    setLoading(true);
    setError(null);
    searchSongs(query)
      .then((results) => {
        setSongs(results);
      })
      .catch((err) => {
        console.error('Error searching songs:', err);
        setError('Failed to fetch search results. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [query]); // Re-run effect when query changes

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">
        Search Results {query && `for "${query}"`}
      </h1>

      {loading && <LoadingSkeleton />}

      {error && (
         <Alert variant="destructive">
            <Frown className="h-4 w-4" />
           <AlertTitle>Error</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      {!loading && !error && songs.length === 0 && query && (
         <Alert>
            <Frown className="h-4 w-4" />
           <AlertTitle>No Results</AlertTitle>
           <AlertDescription>No songs found matching your search criteria.</AlertDescription>
         </Alert>
      )}

      {!loading && !error && songs.length > 0 && (
        <SongList songs={songs} />
      )}

       {!loading && !error && !query && (
         <p className="text-muted-foreground">Please enter a search term to find songs.</p>
       )}
    </div>
  );
}
