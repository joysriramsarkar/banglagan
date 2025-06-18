
'use client';

import React, { useEffect, useState } from 'react';
import { getSongBySlug, type Song } from '@/services/bangla-song-database';
import { mockSongs } from '@/data/all-songs';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music, User, Disc3, Tag, Calendar, Feather, WifiOff, Loader2 } from 'lucide-react';
import { toBengaliNumerals, cleanLyricsForDisplay } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SongPage() {
  const paramsFromHook = useParams<{ slug: string }>();

  const [slug, setSlug] = useState<string | undefined>(undefined);
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [prevSongSlug, setPrevSongSlug] = useState<string | null>(null);
  const [nextSongSlug, setNextSongSlug] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    // This effect is responsible for setting the slug from URL parameters.
    // It also handles the case where slug might not be available.
    const currentRawSlug = paramsFromHook?.slug;

    if (currentRawSlug && typeof currentRawSlug === 'string' && currentRawSlug.trim() !== "") {
      const decodedSlug = decodeURIComponent(currentRawSlug).trim();
      setSlug(decodedSlug);
      // setLoading(true) will be handled by the data fetching effect if slug is valid
      // If slug becomes valid, the second useEffect will trigger.
    } else if (paramsFromHook) { // Check if paramsFromHook itself is available but slug is not
      setFetchError("গানের লিঙ্ক সনাক্ত করা যায়নি বা লিঙ্কটি সঠিক নয়।");
      setSong(null);
      setSlug(undefined);
      setLoading(false); // No valid slug, stop loading and show error.
    }
    // If paramsFromHook is not yet available (e.g. initial render), `loading` remains true from initial state.
  }, [paramsFromHook]);

  useEffect(() => {
    // This effect is responsible for fetching the song data once a valid slug is set.
    if (!slug) {
      // If no slug is set (e.g., initial render, or previous effect determined no valid slug),
      // do nothing here. Loading state should be managed by the first effect if slug is invalid.
      // If slug is just not ready, initial `loading` is true.
      if (!paramsFromHook?.slug && loading && !fetchError) {
        // This means the first effect decided there's no slug and set loading to false and an error.
        // Or, paramsFromHook is still not ready.
      }
      return;
    }

    let isMounted = true;
    const loadSongData = async (s: string) => {
      setLoading(true); // Set loading true before fetching data for this slug
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
            const currentIndex = mockSongs.findIndex(songIter => songIter.slug === s);

            if (currentIndex > -1) {
              const prevSong = currentIndex > 0 ? mockSongs[currentIndex - 1] : null;
              const nextSong = currentIndex < mockSongs.length - 1 ? mockSongs[currentIndex + 1] : null;
              setPrevSongSlug(prevSong ? prevSong.slug : null);
              setNextSongSlug(nextSong ? nextSong.slug : null);
            } else {
              setPrevSongSlug(null);
              setNextSongSlug(null);
            }
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
          setLoading(false);
        }
      }
    };

    loadSongData(slug);
    return () => {
      isMounted = false;
    };
  }, [slug, paramsFromHook?.slug]); // Re-run if slug changes or the raw slug from params changes (for safety)


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
    // This case should ideally be covered by fetchError, or if slug was invalid.
    // If slug was valid, but song not found, getSongBySlug would lead to fetchError.
    // Calling notFound() here if everything seemed fine but song is still null.
    if (slug && !loading && !fetchError) {
         notFound();
    }
    return null; // Or a more specific "Song not available" message if !loading and !fetchError
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

			<Card className="shadow-lg">
				<CardContent className="flex justify-between p-4">
					{prevSongSlug ? (
						<Link href={`/song/${prevSongSlug}`}>
							<Button variant="outline">পূর্ববর্তী গান</Button>
						</Link>
					) : <Button variant="outline" disabled>পূর্ববর্তী গান</Button>}
					{nextSongSlug ? (
						<Link href={`/song/${nextSongSlug}`}>
							<Button variant="outline">পরবর্তী গান</Button>
						</Link>
					) : <Button variant="outline" disabled>পরবর্তী গান</Button>}
				</CardContent>
			</Card>
		</div>
	);
}
