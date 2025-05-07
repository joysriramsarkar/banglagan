'use client';

import * as React from 'react';
import { suggestSongsBasedOnHistory, type SuggestSongsOutput } from '@/ai/flows/suggest-songs';
import { searchSongs } from '@/services/bangla-song-database';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Loader2, WifiOff, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link'; // Import Link
import { cleanString } from '@/lib/utils'; // Import from utils
import type { Song } from '@/types/song'; // Import Song type
import { useToast } from "@/hooks/use-toast"


export default function SongSuggestions() {
  const [suggestions, setSuggestions] = React.useState<SuggestSongsOutput['suggestions'] | null>(null);
  const [loading, setLoading] = React.useState(true); // Start with loading true
  const [error, setError] = React.useState<string | null>(null);
  const [enrichedSuggestions, setEnrichedSuggestions] = React.useState<Song[]>([]);
  const [hasAttemptedFetch, setHasAttemptedFetch] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(true);

  const { toast } = useToast()

   React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  React.useEffect(() => {
    let historyArray: string[] = [];
    if (typeof window !== 'undefined') { // Client-side only check
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
    }

    if (historyArray.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSuggestions(null);
    setEnrichedSuggestions([]);

    if (isOnline) { // Only make the API call if online
      suggestSongsBasedOnHistory({ searchHistory: historyArray.join(',') })
        .then(async (output) => {
          setSuggestions(output.suggestions);
          if (output.suggestions && output.suggestions.length > 0) {
            const enrichedPromises = output.suggestions.map(async (suggestedSong) => {
              const suggestedTitleCleaned = cleanString(suggestedSong.title);
              const suggestedArtistCleaned = cleanString(suggestedSong.artist);

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
                  (s) => (cleanString(s.title) === suggestedTitleCleaned || s.title === suggestedSong.title) && 
                         (cleanString(s.artist) === suggestedArtistCleaned || s.artist === suggestedSong.artist)
                );

                if (matchedSong && matchedSong.slug) {
                   return { ...matchedSong, slug: `/song/${encodeURIComponent(matchedSong.slug)}` };
                } else {
                  // Try a broader search if exact title/artist combo not found, maybe LLM hallucinates slightly different artist/title
                  const broaderResults = await searchSongs(suggestedTitleCleaned || suggestedSong.title);
                  const broaderMatch = broaderResults.find(s => cleanString(s.title) === suggestedTitleCleaned || s.title === suggestedSong.title);
                  if (broaderMatch && broaderMatch.slug) {
                    return { ...broaderMatch, slug: `/song/${encodeURIComponent(broaderMatch.slug)}` };
                  }
                  return fallbackSong;
                }
              } catch (enrichError: any) {
                console.warn(`Error enriching suggestion "${suggestedTitleCleaned}" with searchSongs:`, enrichError);
                return fallbackSong;
              }
            });

            const settledResults = await Promise.allSettled(enrichedPromises);
            const successfullyEnriched = settledResults
              .filter(result => result.status === 'fulfilled')
              .map(result => (result as PromiseFulfilledResult<Song | null>).value)
              .filter(s => s) as Song[];

            setEnrichedSuggestions(successfullyEnriched);

          } else {
            setEnrichedSuggestions([]);
          }
        })
        .catch((err) => {
          console.error("Error in suggestSongsBasedOnHistory or subsequent processing:", err);
          let errorMessage = "এই মুহূর্তে গানের পরামর্শ আনা সম্ভব হচ্ছে না। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।";

          if (err.name === 'FirebaseError' && (err.code === 'unavailable' || err.message?.toLowerCase().includes('offline'))) {
            errorMessage = "গান সুপারিশ করতে সমস্যা হচ্ছে। আপনি কি অফলাইনে আছেন বা সার্ভারের সাথে সংযোগ করতে পারছেন না?";
          } else if (err.message?.toLowerCase().includes('failed to fetch')) {
             errorMessage = "গান সুপারিশ করতে সমস্যা হচ্ছে। আপনার নেটওয়ার্ক সংযোগ পরীক্ষা করুন।";
          } else if (err.message?.toLowerCase().includes('connection closed')) {
             errorMessage = "গান সুপারিশ করার সময় সংযোগ বিচ্ছিন্ন হয়ে গেছে। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।";
          } else if (err.message?.toLowerCase().includes('api key') || err.message?.toLowerCase().includes('quota') || err.message?.toLowerCase().includes('permission denied')) {
             errorMessage = "গান সুপারিশ করার পরিষেবা এই মুহূর্তে উপলব্ধ নেই বা কনফিগারেশন সমস্যা রয়েছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।";
          } else if (err.message?.toLowerCase().includes('model not found') || err.message?.toLowerCase().includes('resource exhausted')) {
             errorMessage = "গান সুপারিশ করার জন্য প্রয়োজনীয় এআই মডেল এই মুহূর্তে উপলব্ধ নেই।";
          }
          
          setError(errorMessage);
          setEnrichedSuggestions([]);

           toast({
              variant: "destructive",
              title: "সুপারিশ আনতে ত্রুটি",
              description: errorMessage,
            })
        })
        .finally(() => {
          setLoading(false);
          setHasAttemptedFetch(true);
        });
    } else {
      setError("আপনি অফলাইনে আছেন। গান সুপারিশ করার জন্য ইন্টারনেট সংযোগ প্রয়োজন।");
      setEnrichedSuggestions([]);
      setLoading(false);
      setHasAttemptedFetch(true);

      toast({
        variant: "destructive",
        title: "সুপারিশ আনতে ত্রুটি",
        description: "আপনি অফলাইনে আছেন। গান সুপারিশ করার জন্য ইন্টারনেট সংযোগ প্রয়োজন।",
      })
    }
  }, [isOnline]);


  if (!hasAttemptedFetch) {
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

  const initialHistory = typeof window !== 'undefined' ? localStorage.getItem('searchHistory') : null;
  let initialHistoryArrayLength = 0;
  if (initialHistory) {
      try {
          const parsed = JSON.parse(initialHistory);
          if(Array.isArray(parsed)) initialHistoryArrayLength = parsed.filter(item => item && String(item).trim() !== '').length;
      } catch {
        // ignore
      }
  }

  if (initialHistoryArrayLength === 0 && !loading && !error) {
    return null;
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
            {error.includes("অফলাইনে") || error.includes("সংযোগ") ? <WifiOff className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <AlertTitle>সুপারিশ আনতে ত্রুটি</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!loading && !error && enrichedSuggestions && enrichedSuggestions.length > 0 && (
          <ul className="space-y-2">
            {enrichedSuggestions.map((song, index) => (
              <li key={`${song.slug}-${index}-${song.title}-${song.artist || 'unknown'}`} className="text-sm">
                <Link href={song.slug!} className="text-primary hover:text-accent hover:underline transition-colors">
                  {`${cleanString(song.title)} - ${cleanString(song.artist)}`}
                  {song.slug?.startsWith('/search') && " (অনুসন্ধান করুন)"}
                </Link>
              </li>
            ))}
          </ul>
        )}
         {!loading && !error && (!enrichedSuggestions || enrichedSuggestions.length === 0) && initialHistoryArrayLength > 0 && (
            <p className="text-muted-foreground text-sm">আপনার সাম্প্রতিক অনুসন্ধানের উপর ভিত্তি করে কোন পরামর্শ উপলব্ধ নেই। নতুন কিছু অনুসন্ধান করে দেখুন।</p>
         )}
      </CardContent>
    </Card>
  );
}

