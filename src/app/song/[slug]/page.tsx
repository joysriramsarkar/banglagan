'use client';

import * as React from 'react';
import { getSongBySlug } from '@/services/bangla-song-database';
import type { Song } from '@/services/bangla-song-database';
import { useParams, notFound as navigateToNotFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music, User, Disc3, Tag, Calendar, ListMusic, Feather, WifiOff, Loader2, Info } from 'lucide-react';
import { toBengaliNumerals, cleanLyricsForDisplay, cleanDisplayString } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';


interface SongPageProps {
  // params are usually for Server Components. In Client Components, we use useParams.
  // params: { slug: string }; // No longer directly used if fetching client-side via useParams
}

export default function SongPage({}: SongPageProps) {
  const params = useParams();
  const rawSlug = params?.slug as string | undefined;

  const [song, setSong] = React.useState<Song | null | undefined>(undefined); // undefined for initial, null if not found
  const [loading, setLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);
  const [decodedSlug, setDecodedSlug] = React.useState<string | null>(null);


  React.useEffect(() => {
     let slugToDecode = '';
     if (rawSlug && typeof rawSlug === 'string' && rawSlug.trim() !== '') {
         try {
             slugToDecode = decodeURIComponent(rawSlug);
             setDecodedSlug(slugToDecode);
         } catch (e) {
             console.warn(`Client-side: Error decoding slug "${rawSlug}", using as is. Error:`, e);
             slugToDecode = rawSlug; // Use raw slug if decoding fails
             setDecodedSlug(slugToDecode);
         }
     } else {
         console.error("Client-side: No valid slug provided in params.");
         setFetchError("কোনো বৈধ গানের লিঙ্ক দেওয়া হয়নি।");
         setLoading(false);
         return;
     }

    async function loadSong(slugToFetch: string) {
      if (!slugToFetch) {
        setFetchError('অবৈধ গানের লিঙ্ক।');
        setLoading(false);
        setSong(null); // Explicitly set to null for "not found" state
        return;
      }
      setLoading(true);
      setFetchError(null);
      try {
        const fetchedSong = await getSongBySlug(slugToFetch);
        if (!fetchedSong) {
          console.error(`Client-side: Song not found for decoded slug: ${slugToFetch}`);
          setFetchError('গানটি খুঁজে পাওয়া যায়নি। লিঙ্কটি সঠিক কিনা দেখে নিন।');
          setSong(null);
        } else {
          setSong(fetchedSong);
        }
      } catch (e: any) {
        console.error(`Client-side: Error fetching song for slug "${slugToFetch}":`, e);
        setFetchError('গানটি লোড করার সময় একটি সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।');
        setSong(null);
      } finally {
        setLoading(false);
      }
    }

    if (slugToDecode) {
        loadSong(slugToDecode);
    }

  }, [rawSlug]); // Depend on rawSlug from params

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">গান লোড হচ্ছে...</p>
      </div>
    );
  }

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

  if (song === null) { // Check for explicitly null (not found)
    // This will trigger the nearest not-found.tsx or a default Next.js 404 page
    // For client-side, it's often better to render a "Not Found" component directly
    // rather than relying on navigateToNotFound() which is more for server actions/components.
     return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
           <Alert variant="destructive" className="max-w-md">
             <WifiOff className="h-5 w-5" />
             <AlertTitle>গান পাওয়া যায়নি</AlertTitle>
             <AlertDescription>আপনি যে গানটি খুঁজছেন সেটি এই মুহূর্তে উপলব্ধ নেই অথবা লিঙ্কটি ভুল।</AlertDescription>
           </Alert>
        </div>
    );
  }


  if (!song) {
     // This case should ideally be handled by the loading or error states above.
     // If it reaches here, it means song is 'undefined' after loading.
     return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
             <Alert variant="destructive" className="max-w-md">
                <WifiOff className="h-5 w-5" />
                <AlertTitle>একটি অপ্রত্যাশিত সমস্যা</AlertTitle>
                <AlertDescription>গানটি লোড করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।</AlertDescription>
             </Alert>
        </div>
    );
  }


  // Song data is available here
  const displayTitle = cleanDisplayString(song.title)?.replace(/-/g, ' ') || 'শিরোনাম উপলব্ধ নেই';
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
                  <Link href={`/search?q=${encodeURIComponent(displayArtist)}`} className="hover:underline hover:text-accent transition-colors">
                    {displayArtist}
                  </Link>
                </div>
                {displayLyricist && displayLyricist !== 'সংগৃহীত' && displayLyricist !== 'অজানা গীতিকার' && displayLyricist !== 'অজানা-গীতিকার' && (
                  <div className="flex items-center gap-2 text-sm">
                    <Feather className="w-4 h-4 flex-shrink-0" />
                    <span>গীতিকার: <Link href={`/search?q=${encodeURIComponent(displayLyricist)}`} className="hover:underline hover:text-accent transition-colors">{displayLyricist}</Link></span>
                  </div>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-primary/90 border-b pb-2 mb-4 flex items-center">
            <Info className="w-5 h-5 mr-2 text-primary/80" />
            গানের তথ্য
          </h2>
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
                 <Link href={`/search?q=${encodeURIComponent(displayGenre)}`} className="hover:underline hover:text-accent transition-colors">
                    {displayGenre}
                 </Link>
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
            <div
              className="whitespace-pre-wrap text-base leading-relaxed font-sans text-foreground/90"
              style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              {displayLyrics}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Moved generateMetadata to its own file: src/app/song/[slug]/metadata.ts
// export const dynamic = 'force-dynamic'; // Ensures the page is dynamically rendered
