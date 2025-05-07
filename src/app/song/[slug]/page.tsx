'use client';

import { getSongBySlug } from '@/services/bangla-song-database';
import type { Song } from '@/services/bangla-song-database';
import { useParams, notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music, User, Disc3, Tag, Calendar, ListMusic, Feather, WifiOff, Loader2, Info } from 'lucide-react';
import { toBengaliNumerals, cleanLyricsForDisplay, cleanDisplayString } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import * as React from 'react';


interface SongPageProps {
    // Props are passed from the parent component that renders this client component
}

export default function SongPage({ }: SongPageProps) {
  const params = useParams<{ slug?: string }>(); // Make slug optional in type
  const [song, setSong] = React.useState<Song | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);
  const [decodedSlugState, setDecodedSlugState] = React.useState<string>(''); // Renamed state variable


  React.useEffect(() => {
     let slugToDecode = '';
     const rawSlug = params?.slug; // Access slug from params

     // console.log("Client-side useEffect: rawSlug from params:", rawSlug);

     if (!rawSlug || typeof rawSlug !== 'string' || rawSlug.trim() === '') {
         console.error("Client-side: No valid slug provided in params.");
         setFetchError("কোনো বৈধ গানের লিঙ্ক দেওয়া হয়নি।");
         setLoading(false);
         return;
     }

     try {
         slugToDecode = decodeURIComponent(rawSlug);
         setDecodedSlugState(slugToDecode); // Update state with decoded slug
         // console.log("Client-side useEffect: Decoded slug:", slugToDecode);
     } catch (e) {
         console.warn(`Client-side: Error decoding slug "${rawSlug}", using as is. Error:`, e);
         slugToDecode = rawSlug; // Use raw slug if decoding fails
         setDecodedSlugState(slugToDecode); // Update state even if decoding failed
     }


    async function loadSong() {
      // Use the state variable which holds the (potentially failed) decoded slug
      const slugForFetch = slugToDecode;

      if (!slugForFetch) {
        console.log("Client-side loadSong: No slug available for fetching.");
        setLoading(false);
        return;
      }

      // console.log("Client-side loadSong: Attempting to fetch song with slug:", slugForFetch);
      setLoading(true);
      setFetchError(null);
      try {
        // Pass the correctly decoded slug to the service
        const fetchedSong = await getSongBySlug(slugForFetch);

        if (!fetchedSong) {
          console.error(`Client-side: Song not found for decoded slug: ${slugForFetch}`);
          setFetchError('গানটি খুঁজে পাওয়া যায়নি। লিঙ্কটি সঠিক কিনা দেখে নিন।');
          setSong(null);
        } else {
           // console.log("Client-side loadSong: Song found:", fetchedSong.title);
           setSong(fetchedSong);
        }
      } catch (e: any) {
        console.error(`Client-side: Error fetching song for decoded slug "${slugForFetch}":`, e);
        setFetchError(`গানটি লোড করতে একটি অপ্রত্যাশিত সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।`);
        setSong(null);
      } finally {
        setLoading(false);
      }
    }

    loadSong();

  }, [params]); // Dependency is params


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
          <AlertTitle>ত্রুটি</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // If loading is complete, no fetch error occurred, but song is still null, show not found.
  if (!loading && !fetchError && !song) {
    console.warn(`SongPage: Rendering notFound because song is null after loading for decoded slug state: ${decodedSlugState}.`);
    notFound();
    return null;
  }

  // Ensure song is not null before accessing properties
  if (!song) {
      // This case should theoretically be covered by the checks above,
      // but adding it for extra safety.
      console.warn("SongPage: Song is unexpectedly null before rendering content.");
      notFound();
      return null;
  }


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
                  <span>{displayArtist}</span>
                </div>
                {displayLyricist && displayLyricist !== 'সংগৃহীত' && displayLyricist !== 'অজানা গীতিকার' && displayLyricist !== 'অজানা-গীতিকার' && (
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

// Remove dynamic export if generateMetadata is moved or handled differently
// export const dynamic = 'force-dynamic'; // Ensures the page is dynamically rendered