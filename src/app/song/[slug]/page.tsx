
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { getSongBySlug, type Song } from '@/services/bangla-song-database';
import { mockSongs } from '@/data/all-songs'; // Corrected import path for mockSongs
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music, User, Disc3, Tag, Calendar, Feather, WifiOff, Loader2, Home, ListMusic, Library, ChevronLeft, ChevronRight, Users as UsersIcon } from 'lucide-react';
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
    const currentRawSlug = paramsFromHook?.slug;

    if (currentRawSlug && typeof currentRawSlug === 'string' && currentRawSlug.trim() !== "") {
      const decodedSlug = decodeURIComponent(currentRawSlug).trim();
      setSlug(decodedSlug);
      setLoading(true); // Set loading to true when slug is identified and data fetching will start
      setFetchError(null); // Clear previous errors
    } else if (paramsFromHook) {
      setFetchError("গানের লিঙ্ক সনাক্ত করা যায়নি বা লিঙ্কটি সঠিক নয়।");
      setSong(null);
      setSlug(undefined);
      setLoading(false);
    }
    // If paramsFromHook is not available yet, do nothing, initial loading state will cover it.
  }, [paramsFromHook]);

  useEffect(() => {
    if (!slug) {
      // If slug is still not set after the first effect (e.g. invalid params or hook not ready),
      // and not already in an error state from the first effect,
      // ensure loading is false.
      if (!fetchError) {
        setLoading(false);
      }
      return;
    }

    let isMounted = true;
    const loadSongData = async (s: string) => {
      // setLoading(true); // Loading is already set true by the first effect when slug is valid
      // setFetchError(null); // Error is also cleared by the first effect
      setSong(null);
      try {
        const fetchedSong = await getSongBySlug(s);
        if (isMounted) {
          if (!fetchedSong) {
            setFetchError('গানটি খুঁজে পাওয়া যায়নি। লিঙ্কটি সঠিক কিনা দেখে নিন।');
            setSong(null);
          } else {
            setSong(fetchedSong);
            const nonPlaceholderSongs = mockSongs.filter(ms => ms.genre !== 'Placeholder');
            const currentIndex = nonPlaceholderSongs.findIndex(songIter => songIter.slug === s);

            if (currentIndex > -1) {
              const prevSong = currentIndex > 0 ? nonPlaceholderSongs[currentIndex - 1] : null;
              const nextSong = currentIndex < nonPlaceholderSongs.length - 1 ? nonPlaceholderSongs[currentIndex + 1] : null;
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
  }, [slug]);


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
    // This will be caught if fetchError is not set but song is null, and not loading
    // This indicates an actual "not found" scenario after trying to load.
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

			<div className="flex justify-between items-center mt-6 mb-6">
					{prevSongSlug ? (
						<Link href={`/song/${prevSongSlug}`}>
							<Button variant="outline" aria-label="পূর্ববর্তী গান">
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
						</Link>
					) : <Button variant="outline" disabled aria-label="পূর্ববর্তী গান (নিষ্ক্রিয়)"><ChevronLeft className="h-5 w-5" /></Button>}
					{nextSongSlug ? (
						<Link href={`/song/${nextSongSlug}`}>
							<Button variant="outline" aria-label="পরবর্তী গান">
                                <ChevronRight className="h-5 w-5" />
                            </Button>
						</Link>
					) : <Button variant="outline" disabled aria-label="পরবর্তী গান (নিষ্ক্রিয়)"><ChevronRight className="h-5 w-5" /></Button>}
			</div>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl text-primary">আরও দেখুন</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 justify-center py-4">
                    <Button variant="outline" asChild className="justify-start text-left h-auto py-2 text-xs hover:bg-accent/50 transition-colors">
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            <span>মূল পাতা</span>
                        </Link>
                    </Button>
                    <Button variant="outline" asChild className="justify-start text-left h-auto py-2 text-xs hover:bg-accent/50 transition-colors">
                        <Link href="/songs">
                            <ListMusic className="mr-2 h-4 w-4" />
                            <span>সকল গান</span>
                        </Link>
                    </Button>
                    <Button variant="outline" asChild className="justify-start text-left h-auto py-2 text-xs hover:bg-accent/50 transition-colors">
                        <Link href="/artists">
                            <UsersIcon className="mr-2 h-4 w-4" />
                            <span>সকল শিল্পী</span>
                        </Link>
                    </Button>
                    <Button variant="outline" asChild className="justify-start text-left h-auto py-2 text-xs hover:bg-accent/50 transition-colors">
                        <Link href="/lyricists">
                            <Feather className="mr-2 h-4 w-4" />
                            <span>সকল গীতিকার</span>
                        </Link>
                    </Button>
                    <Button variant="outline" asChild className="justify-start text-left h-auto py-2 text-xs hover:bg-accent/50 transition-colors">
                        <Link href="/composers">
                            <Disc3 className="mr-2 h-4 w-4" />
                            <span>সকল সুরকার</span>
                        </Link>
                    </Button>
                    <Button variant="outline" asChild className="justify-start text-left h-auto py-2 text-xs hover:bg-accent/50 transition-colors">
                        <Link href="/genres">
                            <Library className="mr-2 h-4 w-4" />
                            <span>সকল ধরণ</span>
                        </Link>
                    </Button>
                </CardContent>
            </Card>
		</div>
	);
}
