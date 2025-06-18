
'use client';

import React, { useEffect, useState } from 'react';
import { getSongBySlug, type Song } from '@/services/bangla-song-database';
// Import mockSongs from the new data file
import { mockSongs } from '@/data/all-songs'; 
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music, User, Disc3, Tag, Calendar, Feather, WifiOff, Loader2 } from 'lucide-react';
import { toBengaliNumerals, cleanLyricsForDisplay } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface PageParams {
  slug: string;
}

export default function SongPage() {
  const paramsFromHook = useParams<PageParams>();
  const rawSlugFromParams = paramsFromHook?.slug;

  const [slug, setSlug] = useState<string | undefined>(undefined);
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [prevSongSlug, setPrevSongSlug] = useState<string | null>(null);
  const [nextSongSlug, setNextSongSlug] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (rawSlugFromParams) {
      const currentSlug = decodeURIComponent(rawSlugFromParams).trim();
      setSlug(currentSlug);
    } else {
      setFetchError("গানের লিঙ্ক সনাক্ত করা যায়নি বা লিঙ্কটি সঠিক নয়।");
      setLoading(false);
    }
  }, [rawSlugFromParams]);

  useEffect(() => {
    if (!slug) {
      if (rawSlugFromParams === undefined && !loading) { // Only set error if params were truly undefined and not just during initial render
         setFetchError("গানের লিঙ্ক সনাক্ত করা যায়নি বা লিঙ্কটি সঠিক নয়।");
         setLoading(false);
      }
      return;
    }

    let isMounted = true;
    const loadSongData = async (s: string) => {
      setLoading(true);
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
  }, [slug, rawSlugFromParams, loading]); // Added loading to dependencies to re-check if slug becomes available

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

			<Card className="shadow-lg">
				<CardContent className="flex justify-between p-4">
					{prevSongSlug ? (
						<Link href={`/song/${prevSongSlug}`} passHref>
							<Button variant="outline">পূর্ববর্তী গান</Button>
						</Link>
					) : <Button variant="outline" disabled>পূর্ববর্তী গান</Button>}
					{nextSongSlug ? (
						<Link href={`/song/${nextSongSlug}`} passHref>
							<Button variant="outline">পরবর্তী গান</Button>
						</Link>
					) : <Button variant="outline" disabled>পরবর্তী গান</Button>}
				</CardContent>
			</Card>
		</div>
	);
}

    