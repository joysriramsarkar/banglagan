'use client';

import { getSongBySlug } from '@/services/bangla-song-database';
import type { Song } from '@/types/song';
import { notFound, useParams } from 'next/navigation'; // Import useParams
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music, User, Disc3, Tag, Calendar, ListMusic, Feather, WifiOff, Loader2 } from 'lucide-react';
import { toBengaliNumerals, cleanLyricsForDisplay, cleanDisplayString } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import * as React from 'react'; 

// Remove params from props as we'll use the hook
export default function SongPage() { 
  const params = useParams<{ slug: string }>(); // Use useParams hook
  const [song, setSong] = React.useState<Song | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);
  const [decodedSlug, setDecodedSlug] = React.useState<string>('');

  // Get the raw slug from params
  const rawSlug = params.slug; 

  React.useEffect(() => {
     let slugToDecode = '';
     // Use rawSlug obtained from useParams
     if (rawSlug && typeof rawSlug === 'string' && rawSlug.trim() !== '') { 
         try {
             // Decode the raw slug
             slugToDecode = decodeURIComponent(rawSlug); 
             setDecodedSlug(slugToDecode);
         } catch (e) {
             console.warn(`Client-side: Error decoding slug "${rawSlug}", using as is. Error:`, e);
             slugToDecode = rawSlug; // Fallback to using the raw slug
             setDecodedSlug(slugToDecode);
         }
     } else {
        console.error("Client-side: No valid slug provided in params.");
        setFetchError("কোনো বৈধ গানের লিঙ্ক দেওয়া হয়নি।");
        setLoading(false);
        // notFound(); // Cannot call notFound in Client Component
        return;
     }


    async function loadSong() {
      if (!slugToDecode) return; // Don't fetch if slug is invalid

      setLoading(true);
      setFetchError(null);
      try {
        console.log(`Client-side: Attempting to fetch song with decoded slug: ${slugToDecode}`);
        const fetchedSong = await getSongBySlug(slugToDecode);

        if (!fetchedSong) {
          console.error(`Client-side: Song not found for decoded slug: ${slugToDecode}`);
          setFetchError('গানটি খুঁজে পাওয়া যায়নি। লিঙ্কটি সঠিক কিনা দেখে নিন।');
        } else {
          setSong(fetchedSong);
        }
      } catch (e: any) {
        console.error(`Client-side: Error fetching song for decoded slug "${slugToDecode}":`, e);
        setFetchError(`গানটি লোড করতে একটি অপ্রত্যাশিত সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।`);
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

  if (fetchError && !song) { 
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Alert variant="destructive" className="max-w-md">
          <WifiOff className="h-5 w-5" />
          <AlertTitle>তথ্য আনতে সমস্যা</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!loading && !fetchError && !song) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <Alert variant="destructive" className="max-w-md">
                <WifiOff className="h-5 w-5" />
                <AlertTitle>গান পাওয়া যায়নি</AlertTitle>
                <AlertDescription>
                    দুঃখিত, "{decodedSlug}" লিঙ্কটির জন্য কোনো গান খুঁজে পাওয়া যায়নি। লিঙ্কটি সঠিক কিনা দেখে আবার চেষ্টা করুন।
                </AlertDescription>
            </Alert>
        </div>
     );
  }

  if (!song) return null; // Should not happen, but satisfies TypeScript


  const displayTitle = cleanDisplayString(song.title) || 'শিরোনাম উপলব্ধ নেই';
  const displayArtist = cleanDisplayString(song.artist) || 'শিল্পী উপলব্ধ নেই';
  const displayLyricist = cleanDisplayString(song.lyricist);
  const displayAlbum = cleanDisplayString(song.album);
  const displayGenre = cleanDisplayString(song.genre);
  const displayLyrics = cleanLyricsForDisplay(song.lyrics);

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
                {displayLyricist && displayLyricist !== 'সংগৃহীত' && displayLyricist !== 'অজানা গীতিকার' && (
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

      {displayLyrics && displayLyrics !== 'গানের কথা পাওয়া যায়নি' && displayLyrics.trim() !== '' && (
        <Card className="overflow-hidden shadow-lg bg-card mt-6">
          <CardHeader className="bg-secondary/10 p-6">
            <CardTitle className="text-2xl font-semibold text-primary/90 flex items-center gap-2">
              <ListMusic className="w-6 h-6 text-primary" />
              <span>গানের কথা</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <pre className="whitespace-pre-wrap text-base leading-relaxed font-sans text-foreground/90">
              {displayLyrics}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export const dynamic = 'force-dynamic'; // Keep dynamic rendering for client component fetching
