
'use client';

import React, { useEffect, useState } from 'react';
import { getSongBySlug, type Song } from '@/services/bangla-song-database';
import { getProcessedMockSongs } from '@/data/all-songs'; // For prev/next songs
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
  const slugFromParams = params?.slug;

  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prevSongSlug, setPrevSongSlug] = useState<string | null>(null);
  const [nextSongSlug, setNextSongSlug] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true); 

    const loadSongData = async () => {
      setError(null); 
      setSong(null); 
      setPrevSongSlug(null);
      setNextSongSlug(null);

      if (typeof slugFromParams !== 'string' || slugFromParams.trim() === '') {
        if (isMounted) {
          setError("গানের লিঙ্ক সঠিক নয় বা অসম্পূর্ণ।");
          setLoading(false);
        }
        return;
      }

      const slugToFetch = slugFromParams.trim();

      try {
        const fetchedSong = await getSongBySlug(slugToFetch);

        if (!isMounted) return;

        if (!fetchedSong) {
          notFound();
          return; 
        } else {
          setSong(fetchedSong);
          
          const allMockSongs = getProcessedMockSongs();
          const nonPlaceholderSongs = allMockSongs.filter(ms => ms.genre !== 'Placeholder');
          const currentIndex = nonPlaceholderSongs.findIndex(s => s.slug === fetchedSong.slug);

          if (currentIndex !== -1) {
            setPrevSongSlug(currentIndex > 0 ? nonPlaceholderSongs[currentIndex - 1].slug : null);
            setNextSongSlug(currentIndex < nonPlaceholderSongs.length - 1 ? nonPlaceholderSongs[currentIndex + 1].slug : null);
          }
        }
      } catch (e: any) {
        if (!isMounted) return;
        console.error(`Failed to load song data for slug: ${slugToFetch}`, e);
        setError("গানটি আনতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    // Ensure slugFromParams is not undefined before attempting to load.
    // This handles the initial render where useParams might not have resolved the slug yet.
    if (slugFromParams !== undefined) {
        loadSongData();
    } else {
        // If slugFromParams is still undefined after initial checks, it implies an issue
        // or the router is not ready. Keep loading or show a specific message.
        // For now, setLoading(true) at the start of useEffect handles the loading UI.
        // If it stays undefined for too long, it might indicate a routing problem.
    }


    return () => {
      isMounted = false;
    };
  }, [slugFromParams]);

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

  if (!song) {
    // This case should ideally be handled by notFound() or the error state.
    // If reached, it's an unexpected state.
    // notFound() should have been called if song is null and no error after loading.
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)]">
             <Alert variant="destructive" className="max-w-2xl mx-auto">
                <WifiOff className="h-4 w-4" />
                <AlertTitle>ত্রুটি</AlertTitle>
                <AlertDescription>গানটি লোড করা সম্ভব হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।</AlertDescription>
            </Alert>
        </div>
    );
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
						<Link href={`/song/${prevSongSlug}`} passHref>
							<Button variant="outline" aria-label="পূর্ববর্তী গান">
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
						</Link>
					) : <Button variant="outline" disabled aria-label="পূর্ববর্তী গান (নিষ্ক্রিয়)"><ChevronLeft className="h-5 w-5" /></Button>}
					
          {nextSongSlug ? (
						<Link href={`/song/${nextSongSlug}`} passHref>
							<Button variant="outline" aria-label="পরবর্তী গান">
                                <ChevronRight className="h-5 w-5" />
                            </Button>
						</Link>
					) : <Button variant="outline" disabled aria-label="পরবর্তী গান (নিষ্ক্রিয়)"><ChevronRight className="h-5 w-5" /></Button>}
			</div>

            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg text-primary">আরও দেখুন</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 justify-center py-3">
                    <Button variant="outline" size="sm" asChild className="text-xs hover:bg-accent/50 transition-colors">
                        <Link href="/">
                            <Home className="mr-1.5 h-3.5 w-3.5" /> 
                            <span>মূল পাতা</span>
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="text-xs hover:bg-accent/50 transition-colors">
                        <Link href="/songs">
                            <ListMusic className="mr-1.5 h-3.5 w-3.5" />
                            <span>সকল গান</span>
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="text-xs hover:bg-accent/50 transition-colors">
                        <Link href="/artists">
                            <UsersIcon className="mr-1.5 h-3.5 w-3.5" />
                            <span>সকল শিল্পী</span>
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="text-xs hover:bg-accent/50 transition-colors">
                        <Link href="/lyricists">
                            <Feather className="mr-1.5 h-3.5 w-3.5" />
                            <span>সকল গীতিকার</span>
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="text-xs hover:bg-accent/50 transition-colors">
                        <Link href="/composers">
                            <Disc3 className="mr-1.5 h-3.5 w-3.5" />
                            <span>সকল সুরকার</span>
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="text-xs hover:bg-accent/50 transition-colors">
                        <Link href="/genres">
                            <Library className="mr-1.5 h-3.5 w-3.5" />
                            <span>সকল ধরণ</span>
                        </Link>
                    </Button>
                </CardContent>
            </Card>
		</div>
	);
}
