
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
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0Zm4.138 16.12a3.83 3.83 0 0 1-2.046.587c-.63 0-1.192-.167-1.922-.515a.48.48 0 0 0-.42.015c-.179.09-.315.255-.315.45v2.924a.465.465 0 0 1-.465.465.465.465 0 0 1-.465-.465V15.52c0-.21-.12-.39-.3-.465a.495.495 0 0 0-.45.03c-.75.36-1.32.54-1.95.54a3.9 3.9 0 0 1-2.146-.6c-.24-.15-.39-.42-.39-.72v-4.5c0-1.65 1.35-3 3-3s3 1.35 3 3v4.5c0 .3-.15.57-.39.72-.24.15-.54.18-.81.09l-.06-.03c-1.32-.66-2.82-1.02-4.38-1.02s-3.06.36-4.38 1.02l-.06.03c-.27.09-.57.06-.81-.09-.24-.15-.39-.42-.39-.72v-4.5c0-1.65 1.35-3 3-3s3 1.35 3 3v4.5c0 .3-.15.57-.39.72-.24.15-.54.18-.81.09-.24-.15-.39-.42-.39-.72v-4.5c0-1.65 1.35-3 3-3s3 1.35 3 3v4.5c0 .3-.15.57-.39.72-.24.15-.54.18-.81.09l-.06-.03c-.66-.33-1.35-.54-2.07-.63v-1.17c1.32.09 2.61-.15 3.78-.69 1.17.54 2.46.78 3.78.69v-1.17c-.72-.09-1.41-.3-2.07-.63l-.06-.03c-.27-.09-.57-.06-.81-.09z"/>
    </svg>
);

const YouTubeMusicIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>YouTube Music</title>
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 7.84a4.16 4.16 0 1 1 0 8.32 4.16 4.16 0 0 1 0-8.32zm0 5.373a1.213 1.213 0 1 0 0-2.426 1.213 1.213 0 0 0 0 2.426zM9.47 12L15.91 8.2v7.6L9.47 12z"/>
    </svg>
);

const AmazonMusicIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Amazon Music</title>
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zM8.86 16.517l-1.31-1.31L12 10.767l4.45 4.45-1.31 1.31L12 13.387l-3.14 3.13zm6.28-5.387c.27 0 .5.23.5.5v3.13c0 .27-.23.5-.5.5s-.5-.23-.5-.5v-3.13c0-.27.23-.5.5-.5zm-8.56 0c.27 0 .5.23.5.5v3.13c0 .27-.23.5-.5.5s-.5-.23-.5-.5v-3.13c0-.27.23-.5.5-.5z"/>
    </svg>
);

const TidalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Tidal</title>
        <path d="M12 0L0 12l12 12 12-12L12 0zm0 3.3l5.7 5.7L12 14.7 6.3 9l5.7-5.7zm0 17.4L3.3 15l3 3 5.7 5.7 5.7-5.7 3-3-8.7 5.7z"/>
    </svg>
);

const DeezerIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Deezer</title>
        <path d="M0 18.286h4.93V24H0v-5.714zM6.158 18.286h4.93V24h-4.93v-5.714zm6.158 0h4.93V24h-4.93v-5.714zm6.158 0H24V24h-5.526v-5.714zM0 12.19h4.93v5.714H0V12.19zm6.158 0h4.93v5.714h-4.93V12.19zm6.158 0h4.93v5.714h-4.93V12.19zM0 6.095h4.93v5.714H0V6.095zm6.158 0h4.93v5.714h-4.93V6.095zM0 0h4.93v5.714H0V0z"/>
    </svg>
);

const PandoraIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Pandora</title>
        <path d="M3.86 3.86a1.32 1.32 0 0 0-1.32 1.32v13.64a1.32 1.32 0 0 0 1.32 1.32h16.28a1.32 1.32 0 0 0 1.32-1.32V5.18a1.32 1.32 0 0 0-1.32-1.32H3.86zM12 18.14a6.14 6.14 0 1 1 0-12.28 6.14 6.14 0 0 1 0 12.28z"/>
    </svg>
);

const QobuzIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Qobuz</title>
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.5a9.5 9.5 0 0 1 9.5 9.5 9.5 9.5 0 0 1-9.5 9.5A9.5 9.5 0 0 1 2.5 12 9.5 9.5 0 0 1 12 2.5zm0 1.846a7.654 7.654 0 0 0-7.654 7.654 7.654 7.654 0 0 0 7.654 7.654 7.654 7.654 0 0 0 7.654-7.654A7.654 7.654 0 0 0 12 4.346zm0 2.769a4.885 4.885 0 0 1 4.885 4.885A4.885 4.885 0 0 1 12 16.885a4.885 4.885 0 0 1-4.885-4.885A4.885 4.885 0 0 1 12 7.115z"/>
    </svg>
);

const GaanaIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Gaana</title>
        <path d="M14.966 4.314c-1.428.618-2.613 1.802-3.23 3.231-.082.193-.207.368-.358.519a4.7 4.7 0 0 0-.519.358c-1.428-1.545-3.376-2.584-5.545-2.584C2.128 5.838 0 7.965 0 11.15c0 3.187 2.128 5.313 5.314 5.313 1.95 0 3.68-.868 4.76-2.227a6.22 6.22 0 0 1 1.037.082c3.187 0 5.314-2.126 5.314-5.313a4.83 4.83 0 0 0-.082-1.037c1.359-1.08 2.227-2.81 2.227-4.761 0-2.83-2.044-5.02-4.87-5.02-1.123 0-2.164.314-3.032.85zm-9.652 3.03c2.035 0 3.762 1.428 4.381 3.375a5.27 5.27 0 0 0-1.037.245c-2.456.618-4.761 2.892-4.761 5.722 0 1.282.494 2.456 1.316 3.375-1.95-.868-3.375-2.81-3.375-5.115 0-3.104 2.373-5.639 5.476-5.639zm9.652 1.237c2.035 0 3.762 1.428 4.381 3.375a5.27 5.27 0 0 0-1.037.245c-2.456.618-4.761 2.892-4.761 5.722 0 1.282.494 2.456 1.316 3.375-1.95-.868-3.375-2.81-3.375-5.115 0-3.104 2.373-5.639 5.476-5.639z"/>
    </svg>
);


const getPlatformBengaliName = (platform: string): string => {
    const lowerPlatform = platform.toLowerCase();
    switch (lowerPlatform) {
        case 'youtube': return 'ইউটিউব';
        case 'youtube music': return 'ইউটিউব মিউজিক';
        case 'spotify': return 'স্পটিফাই';
        case 'apple music': return 'অ্যাপল মিউজিক';
        case 'amazon': return 'অ্যামাজন মিউজিক';
        case 'amazon music': return 'অ্যামাজন মিউজিক';
        case 'tidal': return 'টাইডাল';
        case 'deezer': return 'ডিজার';
        case 'pandora': return 'প্যান্ডোরা';
        case 'qobuz': return 'কোবাজ';
        case 'gaana': return 'গানা';
        default: return platform;
    }
};

const PlatformIcon = ({ platform, className }: { platform: string, className?: string }) => {
    const iconClass = cn("w-5 h-5", className);
    switch (platform.toLowerCase()) {
        case 'youtube':
            return <Youtube className={iconClass} />;
        case 'youtube music':
            return <YouTubeMusicIcon className={cn(iconClass, "fill-current")} />;
        case 'spotify':
            return <SpotifyIcon className={cn(iconClass, "fill-current")} />;
        case 'apple music':
            return <AppleMusicIcon className={cn(iconClass, "fill-current")} />;
        case 'amazon':
        case 'amazon music':
            return <AmazonMusicIcon className={cn(iconClass, "fill-current")} />;
        case 'tidal':
            return <TidalIcon className={cn(iconClass, "fill-current")} />;
        case 'deezer':
            return <DeezerIcon className={cn(iconClass, "fill-current")} />;
        case 'pandora':
            return <PandoraIcon className={cn(iconClass, "fill-current")} />;
        case 'qobuz':
            return <QobuzIcon className={cn(iconClass, "fill-current")} />;
        case 'gaana':
            return <GaanaIcon className={cn(iconClass, "fill-current")} />;
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
                    <CardContent className="flex flex-wrap gap-3">
                        {song.streamingLinks.map((link, index) => (
                           <a
                             key={index}
                             href={link.url}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="flex-grow basis-40 flex items-center p-3 rounded-md bg-secondary/50 hover:bg-accent/50 transition-colors border"
                           >
                                <PlatformIcon platform={link.platform} className="mr-3 text-primary" />
                                <div className="flex-grow">
                                   <p className="font-semibold text-secondary-foreground">{getPlatformBengaliName(link.platform)}</p>
                                   {link.version && <p className="text-xs text-muted-foreground">{link.version}</p>}
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground ml-2" />
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
    
    

    

    