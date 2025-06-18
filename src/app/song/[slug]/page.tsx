'use client';

import React, { useEffect, useState } from 'react';
import { getSongBySlug, type Song } from '@/services/bangla-song-database';
import { mockSongs } from '@/data/all-songs';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music, User, Disc3, Tag, Calendar, Feather, WifiOff, Loader2, Home, ListMusic, Library, ChevronLeft, ChevronRight, Users as UsersIcon } from 'lucide-react';
import { toBengaliNumerals, cleanLyricsForDisplay } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SongPage() {
  const params = useParams<{ slug: string }>();
  // slug can be undefined if params is not ready or slug is not present in the URL
  const slugFromUrl = params?.slug;

  const [songData, setSongData] = useState<{
    song: Song | null;
    loading: boolean;
    error: string | null;
    prevSongSlug: string | null;
    nextSongSlug: string | null;
  }>({
    song: null,
    loading: true, // Initial state: loading
    error: null,
    prevSongSlug: null,
    nextSongSlug: null,
  });

  useEffect(() => {
    // This effect runs when `slugFromUrl` (from `useParams`) changes.
    // If `slugFromUrl` is undefined initially (router not ready), we don't fetch yet.
    // `songData.loading` remains true from initial state.
    if (slugFromUrl === undefined) {
      // If params hook has resolved (i.e., params object exists) but slug is still undefined,
      // it indicates an invalid route or that the slug is missing.
      if (params && slugFromUrl === undefined) { 
        setSongData(prev => ({ ...prev, loading: false, error: "গানের লিঙ্ক সঠিক নয় বা অসম্পূর্ণ।" }));
      }
      // Otherwise, if params itself is undefined, router might still be initializing.
      // songData.loading remains true, showing the loader.
      return;
    }

    // Reset state for the new slug and start loading.
    // This ensures that if we navigate from one song page to another, states are reset.
    setSongData(prev => ({
      ...prev, // Keep existing prev/next slugs if not recalculating yet or if it's part of a more complex state object
      loading: true,
      error: null,
      song: null,
      // Reset prevSongSlug and nextSongSlug here if they should always be recalculated with the song
      prevSongSlug: null,
      nextSongSlug: null,
    }));

    const decodedSlug = decodeURIComponent(slugFromUrl).trim();
    if (decodedSlug === "") {
      setSongData(prev => ({ ...prev, loading: false, error: "গানের লিঙ্ক সনাক্ত করা যায়নি।" }));
      return;
    }

    let isMounted = true;
    const loadData = async () => {
      try {
        const fetchedSong = await getSongBySlug(decodedSlug);
        if (isMounted) {
          if (!fetchedSong) {
            notFound(); // Song not found, trigger Next.js 404 page
            // Note: notFound() might prevent further state updates in this component
            // by unmounting it or redirecting.
          } else {
            // Song found, update state
            const nonPlaceholderSongs = mockSongs.filter(ms => ms.genre !== 'Placeholder');
            const currentIndex = nonPlaceholderSongs.findIndex(s => s.slug === decodedSlug);
            const prev = currentIndex > 0 ? nonPlaceholderSongs[currentIndex - 1].slug : null;
            const next = currentIndex < nonPlaceholderSongs.length - 1 ? nonPlaceholderSongs[currentIndex + 1].slug : null;
            setSongData({ song: fetchedSong, loading: false, error: null, prevSongSlug: prev, nextSongSlug: next });
          }
        }
      } catch (e: any) {
        // Catch any unexpected errors during data fetching or processing
        if (isMounted) {
          console.error("Failed to load song data:", e);
          setSongData(prev => ({ ...prev, loading: false, error: "গানটি আনতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" }));
        }
      }
    };

    loadData();

    return () => {
      isMounted = false; // Cleanup to prevent state updates on unmounted component
    };
  }, [slugFromUrl, params]); // React to changes in slugFromUrl or the params object's availability

  const { song, loading, error, prevSongSlug, nextSongSlug } = songData;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">তথ্য লোড হচ্ছে...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <WifiOff className="h-4 w-4" />
        <AlertTitle>ত্রুটি</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  // If notFound() was called, Next.js should handle rendering its 404 page.
  // This component might unmount or its render output ignored.
  // If we reach here, and !loading and !error, then 'song' should be populated.
  // A final guard in case 'song' is null despite no loading/error state (e.g., if notFound() doesn't stop render immediately).
  if (!song) {
     // This state should ideally not be reached if `notFound()` is effective or an error is always set.
     // Returning null here prevents rendering the rest of the page if song is unexpectedly null.
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

			<div className="flex justify-between items-center mt-6 mb-6 px-1">
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
                            <Home className="mr-2 h-3 w-3" /> 
                            <span>মূল পাতা</span>
                        </Link>
                    </Button>
                    <Button variant="outline" asChild className="justify-start text-left h-auto py-2 text-xs hover:bg-accent/50 transition-colors">
                        <Link href="/songs">
                            <ListMusic className="mr-2 h-3 w-3" />
                            <span>সকল গান</span>
                        </Link>
                    </Button>
                    <Button variant="outline" asChild className="justify-start text-left h-auto py-2 text-xs hover:bg-accent/50 transition-colors">
                        <Link href="/artists">
                            <UsersIcon className="mr-2 h-3 w-3" />
                            <span>সকল শিল্পী</span>
                        </Link>
                    </Button>
                    <Button variant="outline" asChild className="justify-start text-left h-auto py-2 text-xs hover:bg-accent/50 transition-colors">
                        <Link href="/lyricists">
                            <Feather className="mr-2 h-3 w-3" />
                            <span>সকল গীতিকার</span>
                        </Link>
                    </Button>
                    <Button variant="outline" asChild className="justify-start text-left h-auto py-2 text-xs hover:bg-accent/50 transition-colors">
                        <Link href="/composers">
                            <Disc3 className="mr-2 h-3 w-3" />
                            <span>সকল সুরকার</span>
                        </Link>
                    </Button>
                    <Button variant="outline" asChild className="justify-start text-left h-auto py-2 text-xs hover:bg-accent/50 transition-colors">
                        <Link href="/genres">
                            <Library className="mr-2 h-3 w-3" />
                            <span>সকল ধরণ</span>
                        </Link>
                    </Button>
                </CardContent>
            </Card>
		</div>
	);
}
