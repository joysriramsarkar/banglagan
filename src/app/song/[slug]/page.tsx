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
  const slugFromParams = params?.slug;

  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prevSongSlug, setPrevSongSlug] = useState<string | null>(null);
  const [nextSongSlug, setNextSongSlug] = useState<string | null>(null);

  useEffect(() => {
    // Reset states for new slug or initial load
    setLoading(true);
    setError(null);
    setSong(null);
    setPrevSongSlug(null);
    setNextSongSlug(null);

    if (typeof slugFromParams !== 'string' || slugFromParams.trim() === '') {
      setError("গানের লিঙ্ক সঠিক নয় বা অসম্পূর্ণ।");
      setLoading(false);
      return;
    }

    const slugToFetch = slugFromParams.trim();
    let isMounted = true;

    const loadData = async () => {
      try {
        const fetchedSong = await getSongBySlug(slugToFetch);
        if (!isMounted) return;

        if (!fetchedSong) {
          notFound(); // This will render the not-found.tsx page
          // No need to set loading to false here as the component will unmount
        } else {
          setSong(fetchedSong);
          // Find previous and next songs from the main mockSongs array
          const nonPlaceholderSongs = mockSongs.filter(ms => ms.genre !== 'Placeholder');
          const currentIndex = nonPlaceholderSongs.findIndex(s => s.slug === slugToFetch);

          if (currentIndex !== -1) {
            setPrevSongSlug(currentIndex > 0 ? nonPlaceholderSongs[currentIndex - 1].slug : null);
            setNextSongSlug(currentIndex < nonPlaceholderSongs.length - 1 ? nonPlaceholderSongs[currentIndex + 1].slug : null);
          }
          setLoading(false); // Set loading to false only after successful data retrieval
        }
      } catch (e: any) {
        if (!isMounted) return;
        console.error(`Failed to load song data for slug: ${slugToFetch}`, e);
        setError("গানটি আনতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
        setLoading(false); // Set loading to false on error
      }
    };

    loadData();

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

  // If song is null and not loading and no error, it means notFound() should have been called.
  // This explicit check is a fallback. notFound() should handle redirecting to the 404 page.
  if (!song) {
     // This state should ideally not be reached if notFound() is effective or an error is set.
     // If it is reached, it implies an issue not caught by loading/error states or notFound().
     // Returning null or a generic error message to prevent rendering with null song.
     // The not-found.tsx page (triggered by notFound()) is the primary way to handle "song not found".
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
