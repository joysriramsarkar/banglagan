
'use client';

import React, { useEffect, useState } from 'react';
import { getSongBySlug } from '@/services/bangla-song-database';
import { getProcessedMockSongs } from '@/data/all-songs';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music, User, Disc3, Tag, Calendar, Feather, WifiOff, Loader2, Home, ListMusic, Library, ChevronLeft, ChevronRight, Users as UsersIcon, Youtube, Headphones } from 'lucide-react';
import { toBengaliNumerals, cleanLyricsForDisplay } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Song } from '@/types/song';
import { cn } from "@/lib/utils"


const SpotifyIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Spotify</title>
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.922 17.513a.47.47 0 0 1-.652.126c-2.31-1.42-5.242-1.748-8.738-.953a.47.47 0 0 1-.523-.448.47.47 0 0 1 .448-.523c3.743-.852 7.002-.488 9.58 1.05.27.16.35.53.185.8zM18.8 14.15a.593.593 0 0 1-.82.162c-2.6-1.58-6.5-2.076-9.663-1.134a.593.593 0 0 1-.667-.552.593.593 0 0 1 .552-.667c3.51-.99 7.82-.443 10.74 1.34.31.18.42.61.255.918zm.13-3.23a.74.74 0 0 1-1.02.2c-2.95-1.8-7.7-2.2-11.22-1.2A.74.74 0 0 1 5.92 9.09a.74.74 0 0 1 .83-.677c3.96-1.1 9.1-.55 12.42 1.45.35.21.48.7.27 1.05z"/>
    </svg>
);

const AppleMusicIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Apple Music</title>
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 19.714c-1.536 0-2.949-.5-4.142-1.357-.18-.12-.39-.18-.6-.18-.3 0-.57.12-.78.33l-.15.15c-.21.21-.33.48-.33.78 0 .3.12.57.33.78l.15.15c.21.21.48.33.78.33.21 0 .42-.06.6-.18 1.47-.99 3.24-1.59 5.142-1.59 1.903 0 3.673.6 5.143 1.59.18.12.39.18.6.18.3 0 .57-.12.78-.33l-.15-.15c.21-.21.33-.48.33-.78 0-.3-.12-.57-.33-.78l-.15-.15c-.21-.21-.48-.33-.78-.33-.21 0-.42-.06-.6-.18-1.193-.857-2.606-1.357-4.143-1.357zm-1.88-5.314c.24-.15.39-.42.39-.72v-4.5c0-1.65-1.35-3-3-3s-3 1.35-3 3v4.5c0 .3.15.57.39.72.24.15.54.18.81.09l.06-.03c1.32-.66 2.82-1.02 4.38-1.02s3.06.36 4.38 1.02l.06.03c.27.09.57.06.81-.09.24-.15.39-.42.৩৯-.৭২v-৪.৫c০-১.৬৫-১.৩৫-৩-৩-৩s-৩ ১.৩৫-৩ ৩v৪.৫c০ .৩.১৫.৫৭.৩৯.৭২.২৪.১৫.৫৪.১৮.৮১-.০৯.২৪-.১৫.৩৯-.৪২.৩৯-.৭২v-৪.৫c০-১.৬৫-১.৩৫-৩-৩-৩s-৩ ১.৩৫-৩ ৩v৪.৫c০ .৩.১৫.৫৭.৩৯.৭২.২৪.১৫.৫৪.১৮.৮১.০৯l.০৬-.০৩c.৬৬-.৩৩ ১.৩৫-.৫৪ ২.০৭-.৬৩v-১.১৭c-১.৩২-.০৯-২.৬১.১৫-৩.৭৮.৬৯-১.১৭-.৫৪-২.৪৬-.৭৮-৩.৭৮-.৬৯v১.১৭c.৭২.০৯ ১.৪১.৩ ২.০৭.৬৩l.০৬.০৩c.২৭.০৯.৫৭.০৬.৮১-.০৯z"/>
    </svg>
);

const PlatformIcon = ({ platform, className }: { platform: string, className?: string }) => {
    const iconClass = cn("w-5 h-5", className);
    switch (platform.toLowerCase()) {
        case 'youtube':
            return <Youtube className={iconClass} />;
        case 'spotify':
            return <SpotifyIcon className={cn(iconClass, "fill-current")} />;
        case 'apple music':
            return <AppleMusicIcon className={cn(iconClass, "fill-current")} />;
        default:
            return <Headphones className={iconClass} />;
    }
};

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

    const loadSongData = async () => {
      setLoading(true);
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
          
          const allSongs = getProcessedMockSongs();
          const nonPlaceholderSongs = allSongs.filter(ms => ms.genre !== 'Placeholder');
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

    if (slugFromParams !== undefined) {
      loadSongData();
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
    return notFound();
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

            {song.streamingLinks && song.streamingLinks.length > 0 && (
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="text-xl text-primary flex items-center gap-2">
                           <Headphones className="w-6 h-6" />
                           <span>শুনুন</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {song.streamingLinks.map((link, index) => (
                           <a
                             key={index}
                             href={link.url}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="flex items-center p-3 rounded-md bg-secondary/50 hover:bg-accent/50 transition-colors border"
                           >
                                <PlatformIcon platform={link.platform} className="mr-3 text-primary" />
                                <div className="flex-grow">
                                   <p className="font-semibold text-secondary-foreground">{link.platform}</p>
                                   {link.version && <p className="text-xs text-muted-foreground">{link.version}</p>}
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                           </a>
                        ))}
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-between items-center mt-6">
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
    
    