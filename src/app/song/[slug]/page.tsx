
'use client';

import * as React from 'react';
import { getSongBySlug } from '@/services/bangla-song-database';
import type { Song } from '@/services/bangla-song-database';
import { useParams } from 'next/navigation'; // Import and use useParams
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music, User, Disc3, Tag, Calendar, Feather, WifiOff, Loader2 } from 'lucide-react';
import { toBengaliNumerals, cleanLyricsForDisplay } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function SongPage() {
  // Use useParams hook to get the slug directly.
  // The generic type ensures paramsFromHook is { slug: string } or null/undefined if not ready.
  const paramsFromHook = useParams<{ slug: string }>(); 
  
  const [slug, setSlug] = React.useState<string | undefined>(undefined);
  const [song, setSong] = React.useState<Song | null>(null);
  const [loading, setLoading] = React.useState(true); // Combined loading state
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Extract slug from paramsFromHook once available
    const currentSlug = paramsFromHook?.slug;
    if (currentSlug) {
      setSlug(currentSlug.trim());
    } else if (paramsFromHook) { 
      // paramsFromHook exists but slug is not there or empty, could be an invalid route or initial state
      setLoading(false);
      setFetchError("গানের লিঙ্ক সনাক্ত করা যায়নি বা লিঙ্কটি সঠিক নয়।");
    }
    // If paramsFromHook is undefined/null initially, useEffect will re-run when it updates.
  }, [paramsFromHook]); // Depend on paramsFromHook

  React.useEffect(() => {
    // This effect runs when `slug` state is updated.
    if (!slug) {
      // If slug is not set (e.g. paramsFromHook was not ready or slug was invalid),
      // and we are not already in an error state from slug setting.
      if (!fetchError && !loading) { // Avoid setting loading if already handled or error exists
          // setLoading(false); // Ensure loading stops if slug is definitively missing.
      }
      return;
    }

    const loadSongData = async (s: string) => {
      setLoading(true); // Start loading for data fetching
      setFetchError(null);
      setSong(null);
      try {
        const fetchedSong = await getSongBySlug(s);
        if (!fetchedSong) {
          setFetchError('গানটি খুঁজে পাওয়া যায়নি। লিঙ্কটি সঠিক কিনা দেখে নিন।');
          setSong(null);
        } else {
          setSong(fetchedSong);
        }
      } catch (error: any) {
        console.error(`Error fetching song data for slug ${s}:`, error);
        setFetchError('গানটি আনতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
        setSong(null);
      } finally {
        setLoading(false);
      }
    };

    loadSongData(slug);

  }, [slug]); // Depend only on the resolved slug state

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
    // If no song and no error, and not loading, then it's a notFound case.
    notFound();
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
