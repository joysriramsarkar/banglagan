
'use client';

import * as React from 'react';
import { suggestSongsBasedOnHistory, type SuggestSongsOutput } from '@/ai/flows/suggest-songs';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link'; // Import Link
import { createSlug, cleanDisplayString } from '@/lib/utils'; // Import from utils
import type { Song } from '@/services/bangla-song-database'; // Import Song type
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


  if (searchHistory.length === 0 && !loading) { // Also check loading state
    return null; // Don't show the component if there's no search history and not loading
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
            {suggestions.map((suggestedSong, index) => {
              // Clean suggested song title and artist from LLM for display and matching
              const suggestedTitleForDisplay = cleanDisplayString(suggestedSong.title);
              const suggestedArtistForDisplay = cleanDisplayString(suggestedSong.artist);

              // Find the full song details from mockSongs database
              // Match using cleaned display strings for consistency
              const fullSongFromDb: Song | undefined = mockSongs.find(dbSong =>
                cleanDisplayString(dbSong.title) === suggestedTitleForDisplay && // Ensure dbSong.title is also cleaned for comparison
                cleanDisplayString(dbSong.artist) === suggestedArtistForDisplay // Ensure dbSong.artist is also cleaned for comparison
              );

              let linkHref: string;
              let displayText = `${suggestedTitleForDisplay || 'শিরোনাম পাওয়া যায়নি'} - ${suggestedArtistForDisplay || 'শিল্পী পাওয়া যায়নি'}`;

              if (fullSongFromDb) {
                // If a direct match is found in our database, create a slug using canonical data from the DB
                const slug = createSlug(
                  fullSongFromDb.title,
                  fullSongFromDb.artist,
                  fullSongFromDb.lyricist
                );
                linkHref = `/song/${encodeURIComponent(slug)}`;
              } else {
                // Fallback: If no direct match, link to a search page with the LLM's suggested (raw) title and artist
                // Use original, potentially uncleaned values for search query as LLM might have specific phrasing
                const searchQuery = `${suggestedSong.title || ''} ${suggestedSong.artist || ''}`.trim();
                if (searchQuery) {
                    linkHref = `/search?q=${encodeURIComponent(searchQuery)}`;
                    // Optionally, modify display text to indicate it's a search
                    // displayText += " (অনুসন্ধান করুন)";
                } else {
                    // Cannot make a meaningful link if LLM provided no usable title/artist
                    linkHref = '#'; // Or don't render the link at all
                }
              }

              return (
                <li key={`${linkHref}-${index}`} className="text-sm">
                  {linkHref !== '#' ? (
                    <Link href={linkHref} className="text-primary hover:text-accent hover:underline transition-colors">
                       {displayText}
                    </Link>
                  ) : (
                    // Render non-interactive text if no meaningful link can be formed
                    <span className="text-muted-foreground">{displayText} (লিঙ্ক তৈরি করা যায়নি)</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
         {!loading && !error && (!suggestions || suggestions.length === 0) && searchHistory.length > 0 && (
            <p className="text-muted-foreground text-sm">আপনার সাম্প্রতিক অনুসন্ধানের উপর ভিত্তি করে কোন পরামর্শ উপলব্ধ নেই।</p>
         )}
         {/* Case for no history and not loading, but component still shown due to loading initially */}
         {!loading && !error && searchHistory.length === 0 && (
            <p className="text-muted-foreground text-sm">কোনো অনুসন্ধানের ইতিহাস পাওয়া যায়নি।</p>
         )}
      </CardContent>
    </Card>
  );
}

