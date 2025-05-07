
'use client';

import * as React from 'react';
import { suggestSongsBasedOnHistory, type SuggestSongsOutput } from '@/ai/flows/suggest-songs';
import { searchSongs } from '@/services/bangla-song-database'; // Import searchSongs from Firestore version
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { createSlug, cleanDisplayString } from '@/lib/utils';
import type { Song } from '@/types/song';


export default function SongSuggestions() {
  const [suggestions, setSuggestions] = React.useState<SuggestSongsOutput['suggestions'] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searchHistory, setSearchHistory] = React.useState<string[]>([]);
  const [enrichedSuggestions, setEnrichedSuggestions] = React.useState<Song[]>([]);

  React.useEffect(() => {
    const storedHistory = localStorage.getItem('searchHistory');
    const historyArray = storedHistory ? JSON.parse(storedHistory) : [];
    setSearchHistory(historyArray);

    if (historyArray.length > 0) {
      setLoading(true);
      setError(null);
      suggestSongsBasedOnHistory({ searchHistory: historyArray.join(',') })
        .then(async (output) => {
          setSuggestions(output.suggestions);
          if (output.suggestions && output.suggestions.length > 0) {
            const enriched = await Promise.all(
              output.suggestions.map(async (suggestedSong) => {
                const suggestedTitleCleaned = cleanDisplayString(suggestedSong.title);
                const suggestedArtistCleaned = cleanDisplayString(suggestedSong.artist);

                if (!suggestedTitleCleaned || !suggestedArtistCleaned) {
                    // If LLM suggestion is incomplete, return a partial object for search link
                    return {
                        title: suggestedTitleCleaned || 'অজানা শিরোনাম',
                        artist: suggestedArtistCleaned || 'অজানা শিল্পী',
                        lyrics: '', // Placeholder
                        slug: `/search?q=${encodeURIComponent((suggestedSong.title || '') + ' ' + (suggestedSong.artist || ''))}`
                    } as Song;
                }

                // Attempt to find the song in DB by title and artist
                const searchResults = await searchSongs(`${suggestedTitleCleaned} ${suggestedArtistCleaned}`);
                const matchedSong = searchResults.find(
                  (s) => cleanDisplayString(s.title) === suggestedTitleCleaned && cleanDisplayString(s.artist) === suggestedArtistCleaned
                );

                if (matchedSong && matchedSong.slug) {
                  return { ...matchedSong, slug: `/song/${encodeURIComponent(matchedSong.slug)}` };
                } else {
                  // Fallback: if not found or slug is missing, create a search link
                  return { 
                    title: suggestedTitleCleaned, 
                    artist: suggestedArtistCleaned, 
                    lyrics: '', // Placeholder
                    slug: `/search?q=${encodeURIComponent(suggestedTitleCleaned + ' ' + suggestedArtistCleaned)}` 
                  } as Song;
                }
              })
            );
            setEnrichedSuggestions(enriched.filter(s => s) as Song[]);
          }
        })
        .catch((err) => {
          console.error("Error fetching song suggestions:", err);
          setError("এই মুহূর্তে গানের পরামর্শ আনা সম্ভব হচ্ছে না।");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);


  if (searchHistory.length === 0 && !loading) {
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
            <AlertTitle>ত্রুটি</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!loading && !error && enrichedSuggestions && enrichedSuggestions.length > 0 && (
          <ul className="space-y-2">
            {enrichedSuggestions.map((song, index) => (
              <li key={`${song.slug}-${index}`} className="text-sm">
                <Link href={song.slug!} className="text-primary hover:text-accent hover:underline transition-colors">
                  {`${cleanDisplayString(song.title)} - ${cleanDisplayString(song.artist)}`}
                  {song.slug?.startsWith('/search') && " (অনুসন্ধান করুন)"}
                </Link>
              </li>
            ))}
          </ul>
        )}
         {!loading && !error && (!enrichedSuggestions || enrichedSuggestions.length === 0) && searchHistory.length > 0 && (
            <p className="text-muted-foreground text-sm">আপনার সাম্প্রতিক অনুসন্ধানের উপর ভিত্তি করে কোন পরামর্শ উপলব্ধ নেই।</p>
         )}
         {!loading && !error && searchHistory.length === 0 && (
            <p className="text-muted-foreground text-sm">কোনো অনুসন্ধানের ইতিহাস পাওয়া যায়নি।</p>
         )}
      </CardContent>
    </Card>
  );
}
