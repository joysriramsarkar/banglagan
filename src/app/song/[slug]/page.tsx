
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation'; // Corrected import
import { getSongBySlug } from '@/services/bangla-song-database';
import type { Song } from '@/services/bangla-song-database';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music, User, Disc3, Tag, Calendar, Feather, WifiOff, Loader2 } from 'lucide-react';
import { toBengaliNumerals, cleanLyricsForDisplay, cleanDisplayString } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface SongPageProps {
  params: {
    slug: string;
  };
}

// Note: generateMetadata should be in a separate metadata.ts file if this component is 'use client'
// For simplicity with mock data, if this page becomes a server component, metadata can be here.
// However, with 'use client', generateMetadata must be moved.
// Assuming metadata.ts handles metadata generation.

export default function SongPage({ params: paramsFromProps }: SongPageProps) {
  const paramsFromHook = useParams();
  const rawSlugParam = paramsFromHook?.slug || paramsFromProps?.slug;
  const rawSlugFromParams = Array.isArray(rawSlugParam) ? rawSlugParam[0] : rawSlugParam;

  const [song, setSong] = React.useState<Song | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);
  const [decodedSlug, setDecodedSlug] = React.useState<string | null>(null);

  React.useEffect(() => {
    let slugToUse: string | undefined = rawSlugFromParams;

    if (!slugToUse || typeof slugToUse !== 'string' || slugToUse.trim() === '') {
      // console.error("Client-side: No valid slug provided in params.", rawSlugFromParams); // Reduced logging
      setFetchError("কোনো বৈধ গানের লিঙ্ক দেওয়া হয়নি।");
      setLoading(false);
      setSong(null);
      return;
    }
    
    const finalSlug = slugToUse.trim(); // Slug from Next.js router is already URI-decoded.
    setDecodedSlug(finalSlug);

  }, [rawSlugFromParams]);


  React.useEffect(() => {
    if (!decodedSlug) {
      if (rawSlugFromParams) { 
         setLoading(false);
      }
      return;
    }

    const loadSong = async (slugToFetch: string) => {
      setLoading(true);
      setFetchError(null);
      try {
        const fetchedSong = await getSongBySlug(slugToFetch);
        if (!fetchedSong) {
          // console.error(`Client-side: Song not found for decoded slug: ${slugToFetch}`); // Reduced logging
          setFetchError('গানটি খুঁজে পাওয়া যায়নি। লিঙ্কটি সঠিক কিনা দেখে নিন।');
          setSong(null);
        } else {
          setSong(fetchedSong);
        }
      } catch (error: any) {
        // console.error(`Client-side: Error fetching song for slug ${slugToFetch}:`, error); // Reduced logging
        setFetchError('গানটি আনতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
        setSong(null);
      } finally {
        setLoading(false);
      }
    };

    loadSong(decodedSlug);

  }, [decodedSlug, rawSlugFromParams]);


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
     notFound(); 
  }
  
  const displayTitle = song.title.replace(/-/g, ' ');

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
              <Link href={`/search?q=${encodeURIComponent(song.artist)}`} className="ml-1 hover:underline text-primary">
                {song.artist}
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
                 dangerouslySetInnerHTML={{ __html: cleanLyricsForDisplay(song.lyrics).replace(/\n/g, '<br />') }} />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
// export const dynamic = 'force-dynamic'; // Ensures the page is dynamically rendered
// Moved generateMetadata to src/app/song/[slug]/metadata.ts
