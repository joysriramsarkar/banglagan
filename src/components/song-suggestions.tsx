'use client';

import * as React from 'react';
import { suggestSongsBasedOnHistory, type SuggestSongsOutput } from '@/ai/flows/suggest-songs';
import { searchSongs } from '@/services/bangla-song-database';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Loader2, WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { cleanDisplayString } from '@/lib/utils';
import type { Song } from '@/types/song';


export default function SongSuggestions() {
  const [suggestions, setSuggestions] = React.useState<SuggestSongsOutput['suggestions'] | null>(null);
  const [loading, setLoading] = React.useState(true); // Start with loading true
  const [error, setError] = React.useState<string | null>(null);
  const [enrichedSuggestions, setEnrichedSuggestions] = React.useState<Song[]>([]);

  React.useEffect(() => {
    let historyArray: string[] = [];
    try {
      const storedHistory = localStorage.getItem('searchHistory');
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        if (Array.isArray(parsedHistory)) {
          // Ensure all items are strings and filter out empty/nullish values
          historyArray = parsedHistory.map(String).filter(item => item && item.trim() !== '');
        } else {
          console.warn('Search history in localStorage is not an array, resetting.');
          localStorage.setItem('searchHistory', JSON.stringify([]));
        }
      }
    } catch (e) {
      console.error("Error parsing searchHistory from localStorage:", e);
      localStorage.setItem('searchHistory', JSON.stringify([])); // Reset on error
    }

    if (historyArray.length === 0) {
      setLoading(false);
      // No history, so no suggestions to fetch. Can optionally set a message or return null.
      // For now, it will render the "কোনো অনুসন্ধানের ইতিহাস পাওয়া যায়নি।" message if not loading and no error.
      return;
    }

    setLoading(true);
    setError(null);
    setSuggestions(null);
    setEnrichedSuggestions([]);

    suggestSongsBasedOnHistory({ searchHistory: historyArray.join(',') })
      .then(async (output) => {
        setSuggestions(output.suggestions); 
        if (output.suggestions && output.suggestions.length > 0) {
          const enrichedPromises = output.suggestions.map(async (suggestedSong) => {
            const suggestedTitleCleaned = cleanDisplayString(suggestedSong.title);
            const suggestedArtistCleaned = cleanDisplayString(suggestedSong.artist);

            // Default structure for search link fallback
            const fallbackSong: Song = {
              title: suggestedTitleCleaned || 'অজানা শিরোনাম',
              artist: suggestedArtistCleaned || 'অজানা শিল্পী',
              lyrics: '', 
              slug: `/search?q=${encodeURIComponent((suggestedSong.title || '') + ' ' + (suggestedSong.artist || ''))}`
            };

            if (!suggestedTitleCleaned || !suggestedArtistCleaned) {
              return fallbackSong;
            }

            try {
              const searchResults = await searchSongs(`${suggestedTitleCleaned} ${suggestedArtistCleaned}`);
              const matchedSong = searchResults.find(
                (s) => cleanDisplayString(s.title) === suggestedTitleCleaned && cleanDisplayString(s.artist) === suggestedArtistCleaned
              );

              if (matchedSong && matchedSong.slug) {
                return { ...matchedSong, slug: `/song/${encodeURIComponent(matchedSong.slug)}` };
              } else {
                return fallbackSong;
              }
            } catch (enrichError: any) {
              console.warn(`Error enriching suggestion "${suggestedTitleCleaned}" with searchSongs:`, enrichError);
              // If searchSongs itself throws (e.g. network error not caught inside searchSongs), fallback.
              return fallbackSong;
            }
          });
          
          const settledResults = await Promise.allSettled(enrichedPromises);
          const successfullyEnriched = settledResults
            .filter(result => result.status === 'fulfilled')
            .map(result => (result as PromiseFulfilledResult<Song | null>).value)
            .filter(s => s) as Song[];
          
          setEnrichedSuggestions(successfullyEnriched);

          if (settledResults.some(result => result.status === 'rejected')) {
             console.error("Some suggestions could not be enriched due to errors during Promise.allSettled stage.");
             // This case is less likely if individual promises handle their errors.
          }
          if (successfullyEnriched.length === 0 && output.suggestions.length > 0) {
            // All enrichments might have failed or resulted in fallbacks
            // setError("সুপারিশগুলো বিস্তারিত করা সম্ভব হয়নি।"); // Optional: more specific error
          }

        } else {
          setEnrichedSuggestions([]);
        }
      })
      .catch((err) => {
        console.error("Error in suggestSongsBasedOnHistory or subsequent processing:", err);
        if (err.name === 'FirebaseError' && (err.code === 'unavailable' || err.message?.toLowerCase().includes('offline'))) {
          setError("গান সুপারিশ করতে সমস্যা হচ্ছে। আপনি কি অফলাইনে আছেন?");
        } else if (err.message?.toLowerCase().includes('failed to fetch')) { 
           setError("গান সুপারিশ করতে সমস্যা হচ্ছে। নেটওয়ার্ক সংযোগ পরীক্ষা করুন।");
        } else {
          setError("এই মুহূর্তে গানের পরামর্শ আনা সম্ভব হচ্ছে না।");
        }
        setEnrichedSuggestions([]); 
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);


  // Determine if suggestions should be shown at all. If no history, don't show the card.
  // This check must happen after useEffect has run and loading state is resolved.
  const [hasAttemptedFetch, setHasAttemptedFetch] = React.useState(false);
  React.useEffect(() => {
    if (!loading) {
      setHasAttemptedFetch(true);
    }
  }, [loading]);

  if (!hasAttemptedFetch) { // Don't render anything until useEffect has tried to parse history and potentially fetch
    return (
        <Card className="bg-secondary/50 border-accent shadow-md">
         <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
                <Lightbulb className="w-5 h-5 text-accent" />
                <span>আপনার পছন্দের গান হতে পারে</span>
            </CardTitle>
         </CardHeader>
         <CardContent>
            <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">সুপারিশ লোড হচ্ছে...</span>
            </div>
         </CardContent>
        </Card>
    );
  }
  
  // If loading is finished, and there was no history initially, don't render the component.
  // This relies on historyArray parsing logic in useEffect.
  const initialHistory = typeof window !== 'undefined' ? localStorage.getItem('searchHistory') : null;
  let initialHistoryArrayLength = 0;
  if (initialHistory) {
      try {
          const parsed = JSON.parse(initialHistory);
          if(Array.isArray(parsed)) initialHistoryArrayLength = parsed.filter(item => item && String(item).trim() !== '').length;
      } catch {
          // ignore parse error here, handled in useEffect
      }
  }

  if (initialHistoryArrayLength === 0 && !loading && !error) {
    return null; // Don't show the card if there's no history to base suggestions on
  }


  return (
    <Card className="bg-secondary/50 border-accent shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Lightbulb className="w-5 h-5 text-accent" />
          <span>আপনার পছন্দের গান হতে পারে</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">সুপারিশ তৈরি করা হচ্ছে...</span>
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            {error.includes("অফলাইনে") && <WifiOff className="h-4 w-4" />}
            <AlertTitle>ত্রুটি</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!loading && !error && enrichedSuggestions && enrichedSuggestions.length > 0 && (
          <ul className="space-y-2">
            {enrichedSuggestions.map((song, index) => (
              <li key={`${song.slug}-${index}-${song.title}`} className="text-sm"> {/* Ensure unique key */}
                <Link href={song.slug!} className="text-primary hover:text-accent hover:underline transition-colors">
                  {`${cleanDisplayString(song.title)} - ${cleanDisplayString(song.artist)}`}
                  {song.slug?.startsWith('/search') && " (অনুসন্ধান করুন)"}
                </Link>
              </li>
            ))}
          </ul>
        )}
         {!loading && !error && (!enrichedSuggestions || enrichedSuggestions.length === 0) && initialHistoryArrayLength > 0 && (
            <p className="text-muted-foreground text-sm">আপনার সাম্প্রতিক অনুসন্ধানের উপর ভিত্তি করে কোন পরামর্শ উপলব্ধ নেই।</p>
         )}
         {/* This case should be covered by the null return above if initialHistoryArrayLength is 0 */}
         {/* {!loading && !error && initialHistoryArrayLength === 0 && (
            <p className="text-muted-foreground text-sm">কোনো অনুসন্ধানের ইতিহাস পাওয়া যায়নি।</p>
         )} */}
      </CardContent>
    </Card>
  );
}

