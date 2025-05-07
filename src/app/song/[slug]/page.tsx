'use client';

import { getSongBySlug } from '@/services/bangla-song-database';
import type { Song } from '@/services/bangla-song-database'; // Use the interface from the service
import { notFound, useParams } from 'next/navigation'; // Import useParams
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music, User, Disc3, Tag, Calendar, ListMusic, Feather, WifiOff, Loader2 } from 'lucide-react';
import { toBengaliNumerals, cleanLyricsForDisplay, cleanString } from '@/lib/utils'; // Use cleanString for general cleaning
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import * as React from 'react';

// Removed params from props definition as we'll use the hook
interface SongPageProps {} // No props needed now

export default function SongPage() {
  const params = useParams<{ slug: string }>(); // Use useParams hook to get params
  const [song, setSong] = React.useState<Song | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);
  const [decodedSlugState, setDecodedSlugState] = React.useState<string>('');

  // Get the raw slug from params
  const rawSlug = params?.slug; // Access slug safely

  React.useEffect(() => {
     let slugToDecode = '';
     if (rawSlug && typeof rawSlug === 'string' && rawSlug.trim() !== '') {
         try {
             slugToDecode = decodeURIComponent(rawSlug);
             setDecodedSlugState(slugToDecode); // Store decoded slug in state
         } catch (e) {
             console.warn(`Client-side: Error decoding slug "${rawSlug}", using as is. Error:`, e);
             slugToDecode = rawSlug; // Fallback to using the raw slug
             setDecodedSlugState(slugToDecode);
         }
     } else {
        console.error("Client-side: No valid slug provided in params.");
        setFetchError("কোনো বৈধ গানের লিঙ্ক দেওয়া হয়নি।");
        setLoading(false);
        // notFound(); // Cannot call notFound directly in Client Component, handle with error state
        return;
     }

    async function loadSong() {
      if (!slugToDecode) return; // Don't fetch if slug is invalid

      setLoading(true);
      setFetchError(null);
      try {
        console.log(`Client-side: Attempting to fetch song with decoded slug: ${slugToDecode}`);
        // Pass the decoded slug to the service function
        const fetchedSong = await getSongBySlug(slugToDecode);

        if (!fetchedSong) {
          console.error(`Client-side: Song not found for decoded slug: ${slugToDecode}`);
          setFetchError('গানটি খুঁজে পাওয়া যায়নি। লিঙ্কটি সঠিক কিনা দেখে নিন।');
          setSong(null); // Ensure song is null if not found
        } else {
          setSong(fetchedSong);
        }
      } catch (e: any) {
        console.error(`Client-side: Error fetching song for decoded slug "${slugToDecode}":`, e);
        setFetchError(`গানটি লোড করতে একটি অপ্রত্যাশিত সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।`);
         setSong(null); // Ensure song is null on error
      } finally {
        setLoading(false);
      }
    }

    loadSong();

  }, [rawSlug]); // Depend on rawSlug from useParams


   if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">গান লোড হচ্ছে...</p>
      </div>
    );
  }

  // Show specific error message if fetchError exists
  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Alert variant="destructive" className="max-w-md">
          <WifiOff className="h-5 w-5" />
          <AlertTitle>ত্রুটি</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show "not found" message if not loading, no error, but song is still null
  if (!loading && !fetchError && !song) {
     // Use the decoded slug from state for the message
     const messageSlug = decodedSlugState || rawSlug || "এই লিঙ্ক";
     return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <Alert variant="destructive" className="max-w-md">
                <WifiOff className="h-5 w-5" />
                <AlertTitle>গান পাওয়া যায়নি</AlertTitle>
                <AlertDescription>
                   দুঃখিত, "{messageSlug}" লিঙ্কটির জন্য কোনো গান খুঁজে পাওয়া যায়নি। লিঙ্কটি সঠিক কিনা দেখে আবার চেষ্টা করুন।
                </AlertDescription>
            </Alert>
        </div>
     );
  }

  // If song exists (and loading is false, no error), render the song details
  if (!song) return null; // Should not happen if logic above is correct, but satisfies TypeScript


  const displayTitle = cleanString(song.title) || 'শিরোনাম উপলব্ধ নেই';
  const displayArtist = cleanString(song.artist) || 'শিল্পী উপলব্ধ নেই';
  const displayLyricist = cleanString(song.lyricist);
  const displayAlbum = cleanString(song.album);
  const displayGenre = cleanString(song.genre);
  const displayLyrics = cleanLyricsForDisplay(song.lyrics); // Specific cleaning for lyrics

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden shadow-lg bg-card">
        <CardHeader className="bg-primary/10 p-6">
          <div className="flex items-start gap-4">
            <Music className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
            <div className="flex-grow">
              <CardTitle className="text-3xl font-bold text-primary mb-1">{displayTitle}</CardTitle>
              <CardDescription className="text-lg text-foreground/80 pt-1 space-y-1">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span>{displayArtist}</span>
                </div>
                {/* Display lyricist only if available and not generic */}
                {displayLyricist && displayLyricist !== 'সংগৃহীত' && displayLyricist !== 'অজানা-গীতিকার' && (
                  <div className="flex items-center gap-2 text-sm">
                    <Feather className="w-4 h-4 flex-shrink-0" />
                    <span>গীতিকার: {displayLyricist}</span>
                  </div>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-primary/90 border-b pb-2 mb-4">গানের তথ্য</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-base text-foreground/90">
            {displayAlbum && (
              <div className="flex items-center gap-2">
                <Disc3 className="w-5 h-5 text-primary/80 flex-shrink-0" />
                <span className="font-medium">অ্যালবাম:</span>
                <span>{displayAlbum}</span>
              </div>
            )}
            {displayGenre && (
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary/80 flex-shrink-0" />
                <span className="font-medium">ধরণ:</span>
                <span>{displayGenre}</span>
              </div>
            )}
            {song.releaseYear && (
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary/80 flex-shrink-0" />
                <span className="font-medium">প্রকাশের বছর:</span>
                <span>{toBengaliNumerals(song.releaseYear.toString())}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conditionally render lyrics card */}
      {displayLyrics && displayLyrics !== 'গানের কথা পাওয়া যায়নি' && displayLyrics.trim() !== '' && (
        <Card className="overflow-hidden shadow-lg bg-card mt-6">
          <CardHeader className="bg-secondary/10 p-6">
            <CardTitle className="text-2xl font-semibold text-primary/90 flex items-center gap-2">
              <ListMusic className="w-6 h-6 text-primary" />
              <span>গানের কথা</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Use <pre> for preserving whitespace and line breaks in lyrics */}
            <pre className="whitespace-pre-wrap text-base leading-relaxed font-sans text-foreground/90">
              {displayLyrics}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Keep dynamic rendering strategy if needed, but metadata generation is moved
export const dynamic = 'force-dynamic';
