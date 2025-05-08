'use client'; 

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { searchSongs, type Song } from '@/services/bangla-song-database';
import SongList from '@/components/song-list';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Frown, WifiOff, SearchIcon } from 'lucide-react'; 
import { toBengaliNumerals } from '@/lib/utils';

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
        setSongs(results || []); 
      })
      .catch((err) => {
        console.error('Error searching songs (mock):', err);
        setError('অনুসন্ধান ফলাফল আনতে ব্যর্থ। অনুগ্রহ করে পরে আবার চেষ্টা করুন।');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [query]); 

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-3xl font-bold text-primary">
        <SearchIcon className="w-7 h-7" />
        <h1>
          {query 
            ? `অনুসন্ধান ফলাফল "${query}" এর জন্য`
            : 'অনুসন্ধান'}
          {!loading && !error && query && songs.length > 0 && (
            <span className="text-xl text-muted-foreground ml-2">
              (মোট: {toBengaliNumerals(songs.length)} টি)
            </span>
          )}
        </h1>
      </div>

      {loading && <LoadingSkeleton />}

      {error && (
         <Alert variant="destructive">
            <WifiOff className="h-4 w-4" /> 
           <AlertTitle>ত্রুটি</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      {!loading && !error && songs.length === 0 && query && (
         <Alert>
            <Frown className="h-4 w-4" />
           <AlertTitle>কোন ফলাফল পাওয়া যায়নি</AlertTitle>
           <AlertDescription>আপনার অনুসন্ধানের সাথে মিলে যাওয়া কোনো গান পাওয়া যায়নি।</AlertDescription>
         </Alert>
      )}

      {!loading && !error && songs.length > 0 && (
        <SongList songs={songs} />
      )}

       {!loading && !error && !query && (
         <p className="text-muted-foreground">গান, শিল্পী বা গীতিকার খুঁজতে অনুগ্রহ করে একটি অনুসন্ধান শব্দ লিখুন।</p>
       )}
    </div>
  );
}
