
'use client';

import * as React from 'react';
import { getSongBySlug } from '@/services/bangla-song-database';
import type { Song } from '@/services/bangla-song-database';
// useParams is not strictly needed if params are passed as props and resolved, but can be kept if other client-side param access is planned.
// For this fix, we will resolve the params prop.
// import { useParams } from 'next/navigation'; 
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music, User, Disc3, Tag, Calendar, Feather, WifiOff, Loader2 } from 'lucide-react';
import { toBengaliNumerals, cleanLyricsForDisplay } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

// Define props for the page component where params might be a Promise
// to satisfy the build system's type constraint.
interface PagePropsForBuild {
  params: Promise<{ slug: string }>; // params is a Promise resolving to { slug: string }
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function SongPage({ params: paramsPromise }: PagePropsForBuild) {
  const [slug, setSlug] = React.useState<string | undefined>();
  const [isLoadingSlug, setIsLoadingSlug] = React.useState(true);

  React.useEffect(() => {
    let isActive = true;
    paramsPromise
      .then(resolvedParams => {
        if (isActive && resolvedParams) {
          setSlug(resolvedParams.slug);
        } else if (isActive) {
          setSlug(undefined); // Handle case where resolvedParams might be null/undefined
        }
      })
      .catch(error => {
        if (isActive) {
          console.error("Error resolving params promise:", error);
          setSlug(undefined);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingSlug(false);
        }
      });
    return () => {
      isActive = false;
    };
  }, [paramsPromise]);

  const [song, setSong] = React.useState<Song | null>(null);
  const [loadingData, setLoadingData] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isLoadingSlug) {
      // Do nothing if slug is still loading
      // Ensure loadingData reflects this initial state or is set true
      if (!loadingData && !song && !fetchError) setLoadingData(true);
      return;
    }

    if (!slug) {
      // Slug has resolved to undefined/empty, or was never set
      setLoadingData(false);
      if (!fetchError) { // Avoid overwriting an error from slug resolution
        setFetchError("গানের লিঙ্ক সনাক্ত করা যায়নি বা লিঙ্কটি সঠিক নয়।");
      }
      setSong(null);
      return;
    }

    const finalSlugToFetch = slug.trim();
    if (!finalSlugToFetch) {
        setLoadingData(false);
        setFetchError("কোনো বৈধ গানের লিঙ্ক দেওয়া হয়নি।");
        setSong(null);
        return;
    }

    const loadSong = async (s: string) => {
      setLoadingData(true); // Explicitly set loading before fetch
      setFetchError(null);
      try {
        const fetchedSong = await getSongBySlug(s);
        if (!fetchedSong) {
          setFetchError('গানটি খুঁজে পাওয়া যায়নি। লিঙ্কটি সঠিক কিনা দেখে নিন।');
          setSong(null);
        } else {
          setSong(fetchedSong);
        }
      } catch (error: any) {
        setFetchError('গানটি আনতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
        setSong(null);
      } finally {
        setLoadingData(false);
      }
    };

    loadSong(finalSlugToFetch);

  }, [slug, isLoadingSlug]); // Depend on resolved slug and its loading state

  if (isLoadingSlug || loadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">তথ্য লোড হচ্ছে...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <WifiOff className="h-4 w-4" />
        <AlertTitle>ত্রুটি</AlertTitle>
        <AlertDescription>{fetchError}</AlertDescription>
      </Alert>
    );
  }

  if (!song) {
    // This will trigger the not-found.tsx UI boundary if slug was valid but song not found by getSongBySlug
    // Or if fetchError led to song being null.
    // If slug itself was invalid, fetchError should be set.
    notFound(); 
  }

  const displayTitle = song.title;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <Music className="w-8 h-8 text-primary" />
            <CardTitle className="text-3xl font-bold text-primary">{displayTitle}</CardTitle>
          </div>
          <Separator className="my-3" />
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2 text-primary/80" />
              <strong>শিল্পী:</strong>
              <Link href={`/search?q=${encodeURIComponent(song.artist || 'অজানা শিল্পী')}`} className="ml-1 hover:underline text-primary">
                {song.artist || 'অজানা শিল্পী'}
              </Link>
            </div>
            {song.lyricist && song.lyricist !== 'অজানা গীতিকার' && (
              <div className="flex items-center">
                <Feather className="w-4 h-4 mr-2 text-primary/80" />
                <strong>গীতিকার:</strong>
                <Link href={`/search?q=${encodeURIComponent(song.lyricist)}`} className="ml-1 hover:underline text-primary">
                  {song.lyricist}
                </Link>
              </div>
            )}
            {song.composer && song.composer !== 'অজানা সুরকার' && (
              <div className="flex items-center">
                <Disc3 className="w-4 h-4 mr-2 text-primary/80" />
                <strong>সুরকার:</strong>
                <Link href={`/search?q=${encodeURIComponent(song.composer)}`} className="ml-1 hover:underline text-primary">
                  {song.composer}
                </Link>
              </div>
            )}
            {song.genre && song.genre !== 'অজানা ধরণ' && (
              <div className="flex items-center">
                <Tag className="w-4 h-4 mr-2 text-primary/80" />
                <strong>ধরণ:</strong>
                <Link href={`/search?q=${encodeURIComponent(song.genre)}`} className="ml-1 hover:underline text-primary">
                  {song.genre}
                </Link>
              </div>
            )}
            {song.releaseYear && song.releaseYear > 0 && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-primary/80" />
                <strong>প্রকাশের বছর:</strong>
                <span className="ml-1">{toBengaliNumerals(song.releaseYear)}</span>
              </div>
            )}
          </div>
        </CardHeader>
        {song.lyrics && song.lyrics.trim() !== 'গানের কথা পাওয়া যায়নি' && song.lyrics.trim() !== displayTitle && (
          <CardContent>
            <CardDescription className="mt-2 mb-2 text-base font-semibold text-foreground">গানের কথা:</CardDescription>
            <Separator className="mb-4" />
            <div className="whitespace-pre-wrap leading-relaxed text-foreground/90 lyrics-container"
                 dangerouslySetInnerHTML={{ __html: cleanLyricsForDisplay(song.lyrics) }} />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
