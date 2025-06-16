
'use client';

import * as React from 'react';
import { getSongBySlug } from '@/services/bangla-song-database';
import type { Song } from '@/services/bangla-song-database';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music, User, Disc3, Tag, Calendar, Feather, WifiOff, Loader2 } from 'lucide-react';
import { toBengaliNumerals, cleanLyricsForDisplay } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

interface PageResolvedParams {
  slug: string;
}

interface SongPageActualProps {
  params: Promise<PageResolvedParams>;
}

export default function SongPage(props: SongPageActualProps) {
  const [slug, setSlug] = React.useState<string | undefined>(undefined);
  const [song, setSong] = React.useState<Song | null>(null);
  const [loading, setLoading] = React.useState(true); // Start true: must resolve params first
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    async function resolveParamsAndSetSlug() {
      // setLoading(true); // Already true by default or from previous run
      try {
        const resolvedParams = await props.params;
        if (isMounted) {
          if (resolvedParams?.slug) {
            const currentSlug = resolvedParams.slug.trim();
            setSlug(currentSlug);
            // Do not setLoading(false) here, let the song fetching effect do that
          } else {
            setFetchError("গানের লিঙ্ক সনাক্ত করা যায়নি বা লিঙ্কটি সঠিক নয়।");
            setLoading(false); // Error in params, stop loading
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error resolving page params:", error);
          setFetchError("পৃষ্ঠার তথ্য লোড করতে সমস্যা হয়েছে।");
          setLoading(false); // Error in params, stop loading
        }
      }
    }

    resolveParamsAndSetSlug();

    return () => {
      isMounted = false;
    };
  }, [props.params]); // Re-run if the params promise itself changes

  React.useEffect(() => {
    if (!slug) {
      // If slug is not yet resolved, or was invalid, don't fetch.
      // setLoading(false) is handled by the params effect if slug resolution fails.
      return;
    }

    let isMounted = true;
    const loadSongData = async (s: string) => {
      setLoading(true); // Explicitly set loading before fetching song data
      setFetchError(null);
      setSong(null);
      try {
        const fetchedSong = await getSongBySlug(s);
        if (isMounted) {
          if (!fetchedSong) {
            setFetchError('গানটি খুঁজে পাওয়া যায়নি। লিঙ্কটি সঠিক কিনা দেখে নিন।');
            setSong(null);
          } else {
            setSong(fetchedSong);
          }
        }
      } catch (error: any) {
        if (isMounted) {
          console.error(`Error fetching song data for slug ${s}:`, error);
          setFetchError('গানটি আনতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
          setSong(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false); // Loading finishes after song data attempt
        }
      }
    };

    loadSongData(slug);
    return () => {
      isMounted = false;
    };
  }, [slug]); // This effect runs when the slug state is updated

  if (loading) {
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
     // If slug was resolved, loading is false, no error, but still no song, then call notFound.
    if (slug && !loading && !fetchError) {
        notFound();
    }
    return null;
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
