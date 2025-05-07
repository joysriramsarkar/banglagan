// app/song/[slug]/page.tsx
'use client'; // This page uses client-side hooks for data fetching and state management

import { getSongBySlug } from '@/services/bangla-song-database';
import type { Song } from '@/types/song';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music, User, Disc3, Tag, Calendar, ListMusic, Feather, WifiOff, Frown } from 'lucide-react';
import { toBengaliNumerals, cleanLyricsForDisplay, cleanDisplayString } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface SongPageProps {
  params: {
    slug: string;
  };
}

function SongPageSkeleton() {
  return (
    <div className="space-y-8">
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-primary/10 p-6">
          <div className="flex items-start gap-4">
            <Skeleton className="w-8 h-8 rounded mt-1 flex-shrink-0" />
            <div className="flex-grow space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-5 w-1/3" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-7 w-1/3 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="w-5 h-5 rounded flex-shrink-0" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-28" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
       <Card className="overflow-hidden shadow-lg bg-card mt-6">
          <CardHeader className="bg-secondary/10 p-6">
            <Skeleton className="h-7 w-1/4" />
          </CardHeader>
          <CardContent className="p-6 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
    </div>
  );
}


export default function SongPage({ params }: SongPageProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [song, setSong] = React.useState<Song | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadSong() {
      setIsLoading(true);
      setError(null);
      try {
        if (!params.slug || typeof params.slug !== 'string' || params.slug.trim() === '') {
            console.error("SongPage: No valid slug provided.");
            setError("গান সনাক্তকারী অনুপস্থিত বা ত্রুটিপূর্ণ।");
            setIsLoading(false);
            // notFound(); // This would immediately show the not-found page.
                         // Depending on UX, might want to show error message first.
            return;
        }
        
        console.log(`Attempting to fetch song with slug: ${params.slug}`);
        const fetchedSong = await getSongBySlug(params.slug);
        
        if (!fetchedSong) {
          console.error(`SongPage: Song not found for slug: ${params.slug}. Decoded: ${decodeURIComponent(params.slug)}`);
          // setError will be handled by the main return block to show "Not Found" message
          // notFound() will be called if song is still undefined after loading
        }
        setSong(fetchedSong);
      } catch (e: any) {
        console.error("SongPage: Error fetching song (mock):", e);
        setError("গানটি লোড করতে একটি অপ্রত্যাশিত সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।");
      } finally {
        setIsLoading(false);
      }
    }
    loadSong();
  }, [params.slug]);


  if (isLoading) {
    return <SongPageSkeleton />;
  }

  if (error) { // If an explicit error was set during fetching (other than not found)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Alert variant="destructive" className="max-w-md">
          {/* Using WifiOff icon generally for fetch errors, but could be more generic */}
          <WifiOff className="h-5 w-5" /> 
          <AlertTitle>তথ্য আনতে সমস্যা</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!song) { 
    // This handles the case where loading is done, no explicit error was set, but song is still undefined.
    // This implies the song was not found by getSongBySlug.
    // We call notFound() here to render the dedicated not-found.tsx page.
    notFound();
    return null; // notFound() throws an error, so this line might not be reached.
                 // It's good practice for type safety and to satisfy React's need for a return.
  }

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
                        <Disc3 className="w-5 h-5 text-primary/80 flex-shrink-0"/>
                        <span className="font-medium">অ্যালবাম:</span>
                        <span>{displayAlbum}</span>
                    </div>
                )}
                {displayGenre && (
                    <div className="flex items-center gap-2">
                        <Tag className="w-5 h-5 text-primary/80 flex-shrink-0"/>
                        <span className="font-medium">ধরণ:</span>
                        <span>{displayGenre}</span>
                    </div>
                 )}
                 {song.releaseYear && (
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary/80 flex-shrink-0"/>
                        <span className="font-medium">প্রকাশের বছর:</span>
                        <span>{toBengaliNumerals(song.releaseYear)}</span>
                    </div>
                 )}
             </div>
        </CardContent>

          {displayLyrics && displayLyrics !== 'গানের কথা এখানে যোগ করা হবে...' && displayLyrics.trim() !== '' && displayLyrics !== 'গানের কথা পাওয়া যায়নি' && (
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
      </Card>
    </div>
  );
}

// Keep dynamic for development, can be re-evaluated for production
export const dynamic = 'force-dynamic'; 

export async function generateMetadata({ params }: SongPageProps) {
  try {
    // getSongBySlug will use the mock data service
    const song = await getSongBySlug(params.slug);

    if (!song) {
      return {
        title: 'গান পাওয়া যায়নি - বাংলা গান',
        description: 'আপনি যে গানটি খুঁজছেন তা পাওয়া যায়নি।',
      };
    }

    const metaTitle = cleanDisplayString(song.title) || 'শিরোনামহীন গান';
    const metaArtist = cleanDisplayString(song.artist) || 'অজানা শিল্পী';

    return {
      title: `${metaTitle} - ${metaArtist} | বাংলা গান`,
      description: `${metaTitle} গানের তথ্য ও লিরিক্স (যদি থাকে) ব্রাউজ করুন। শিল্পী: ${metaArtist}।`,
      openGraph: {
          title: `${metaTitle} - ${metaArtist} | বাংলা গান`,
          description: `গানের বিবরণ এবং লিরিক্স (যদি উপলব্ধ থাকে)।`,
      },
    };
  } catch (error) {
    console.error(`generateMetadata: Error for slug ${params.slug} (mock):`, error);
    return {
      title: 'তথ্য লোড করতে সমস্যা - বাংলা গান',
      description: 'গানটির তথ্য এই মুহূর্তে আনা সম্ভব হচ্ছে না।',
    };
  }
}
