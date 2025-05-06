'use client';

import * as React from 'react';
import { suggestSongsBasedOnHistory, type SuggestSongsOutput } from '@/ai/flows/suggest-songs';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link'; // Import Link
import { createSlug } from '@/lib/utils'; // Import from utils
import { mockSongs } from '@/services/bangla-song-database'; // Import mockSongs to find lyricist

export default function SongSuggestions() {
  const [suggestions, setSuggestions] = React.useState<SuggestSongsOutput['suggestions'] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searchHistory, setSearchHistory] = React.useState<string[]>([]);

  React.useEffect(() => {
    // This effect runs only on the client after hydration
    const storedHistory = localStorage.getItem('searchHistory');
    const historyArray = storedHistory ? JSON.parse(storedHistory) : [];
    setSearchHistory(historyArray); // Set the history state

    if (historyArray.length > 0) {
      setLoading(true);
      setError(null);
      suggestSongsBasedOnHistory({ searchHistory: historyArray.join(',') })
        .then((output) => {
          setSuggestions(output.suggestions);
        })
        .catch((err) => {
          console.error("Error fetching song suggestions:", err);
          setError("এই মুহূর্তে গানের পরামর্শ আনা সম্ভব হচ্ছে না।");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []); // Empty dependency array ensures this runs once on mount


  if (searchHistory.length === 0) {
    return null; // Don't show the component if there's no search history
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
        {!loading && !error && suggestions && suggestions.length > 0 && (
          <ul className="space-y-2">
            {suggestions.map((song, index) => {
              // Find the full song details from mock data to get the lyricist
              const fullSong = mockSongs.find(s => s.title === song.title && s.artist === song.artist);
              // Use the createSlug function with title, artist, and lyricist (if found)
              const slug = createSlug(song.title, song.artist, fullSong?.lyricist);
              return (
                <li key={index} className="text-sm">
                  {/* Ensure the slug is properly encoded for the URL */}
                  <Link href={`/song/${encodeURIComponent(slug)}`} className="text-primary hover:text-accent hover:underline transition-colors">
                     <span className="font-medium">{song.title}</span> - {song.artist}
                     {/* Optionally display lyricist here too */}
                     {/* {fullSong?.lyricist && ` (${fullSong.lyricist})`} */}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
         {!loading && !error && (!suggestions || suggestions.length === 0) && (
            <p className="text-muted-foreground text-sm">আপনার সাম্প্রতিক অনুসন্ধানের উপর ভিত্তি করে কোন পরামর্শ উপলব্ধ নেই।</p>
         )}
      </CardContent>
    </Card>
  );
}
