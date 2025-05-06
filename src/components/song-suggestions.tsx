'use client';

import * as React from 'react';
import { suggestSongsBasedOnHistory, type SuggestSongsOutput } from '@/ai/flows/suggest-songs';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link'; // Import Link

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
          setError("Could not fetch song suggestions at this time.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []); // Empty dependency array ensures this runs once on mount

  // Function to create slugs (reuse from SongCard or centralize it)
  const createSlug = (title: string, artist: string) => {
    return `${title.toLowerCase().replace(/\s+/g, '-')}-by-${artist.toLowerCase().replace(/\s+/g, '-')}`;
  };

  if (searchHistory.length === 0) {
    return null; // Don't show the component if there's no search history
  }

  return (
    <Card className="bg-secondary/50 border-accent shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Lightbulb className="w-5 h-5 text-accent" />
          <span>Songs You Might Like</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Generating recommendations...</span>
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!loading && !error && suggestions && suggestions.length > 0 && (
          <ul className="space-y-2">
            {suggestions.map((song, index) => {
              const slug = createSlug(song.title, song.artist);
              return (
                <li key={index} className="text-sm">
                  <Link href={`/song/${slug}`} className="text-primary hover:text-accent hover:underline transition-colors">
                     <span className="font-medium">{song.title}</span> by {song.artist}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
         {!loading && !error && (!suggestions || suggestions.length === 0) && (
            <p className="text-muted-foreground text-sm">No suggestions available based on your recent searches.</p>
         )}
      </CardContent>
    </Card>
  );
}
