// app/song/[slug]/page.tsx
// Removed 'use client' to make this a Server Component again.

import { getSongBySlug } from '@/services/bangla-song-database';
import type { Song } from '@/types/song';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music, User, Disc3, Tag, Calendar, ListMusic, Feather, WifiOff } from 'lucide-react';
import { toBengaliNumerals, cleanLyricsForDisplay, cleanDisplayString } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import * as React from 'react'; // Keep React for JSX

interface SongPageProps {
  params: {
    slug: string;
  };
}

// Now this is a Server Component
export default async function SongPage({ params }: SongPageProps) {
  let song: Song | undefined;
  let fetchError: string | null = null;

  if (!params.slug || typeof params.slug !== 'string' || params.slug.trim() === '') {
    console.error("SongPage (Server): No valid slug provided.");
    notFound();
  }

  const decodedSlug = decodeURIComponent(params.slug);

  try {
    console.log(`Server-side: Attempting to fetch song with slug: ${decodedSlug}`);
    // Fetch data directly in the Server Component
    song = await getSongBySlug(decodedSlug);

    if (!song) {
      console.error(`Server-side: Song not found for slug: ${decodedSlug}`);
      notFound();
    }
  } catch (e: any) {
    console.error(`Server-side: Error fetching song for slug "${decodedSlug}":`, e);
    fetchError = `গানটি লোড করতে একটি অপ্রত্যাশিত সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন। বিস্তারিত: ${e.message}`;
  }

  // Handle fetch error display
  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Alert variant="destructive" className="max-w-md">
          <WifiOff className="h-5 w-5" />
          <AlertTitle>তথ্য আনতে সমস্যা</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // At this point, `song` must be defined due to the notFound() calls above.
  if (!song) {
    // This should theoretically not be reached if notFound works, but as a safeguard:
    console.error(`Server-side: Song became undefined unexpectedly for slug: ${decodedSlug}`);
    notFound();
  }


  const displayTitle = cleanDisplayString(song.title) || 'শিরোনাম উপলব্ধ নেই';
  const displayArtist = cleanDisplayString(song.artist) || 'শিল্পী উপলব্ধ নেই';
  const displayLyricist = cleanDisplayString(song.lyricist);
  const displayAlbum = cleanDisplayString(song.album);
  const displayGenre = cleanDisplayString(song.genre);
  const displayLyrics = cleanLyricsForDisplay(song.lyrics);

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden shadow-lg bg-card">
        <CardHeader className="bg-primary/10 p-6">
          <div className="flex items-start gap-4">
            <Music className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
            <div className="flex-grow">
              <CardTitle className="text-3xl font-bold text-primary mb-1">{displayTitle}</CardTitle>
              <CardDescription className="text-lg text-foreground/80 pt-1 space-y-1">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span>{displayArtist}</span>
                </div>
                {displayLyricist && displayLyricist !== 'সংগৃহীত' && displayLyricist !== 'অজানা গীতিকার' && (
                  <div className="flex items-center gap-2 text-sm">
                    <Feather className="w-4 h-4 flex-shrink-0" />
                    <span>গীতিকার: {displayLyricist}</span>
                  </div>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-primary/90 border-b pb-2 mb-4">গানের তথ্য</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-base text-foreground/90">
            {displayAlbum && (
              <div className="flex items-center gap-2">
                <Disc3 className="w-5 h-5 text-primary/80 flex-shrink-0" />
                <span className="font-medium">অ্যালবাম:</span>
                <span>{displayAlbum}</span>
              </div>
            )}
            {displayGenre && (
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary/80 flex-shrink-0" />
                <span className="font-medium">ধরণ:</span>
                <span>{displayGenre}</span>
              </div>
            )}
            {song.releaseYear && (
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary/80 flex-shrink-0" />
                <span className="font-medium">প্রকাশের বছর:</span>
                <span>{toBengaliNumerals(song.releaseYear.toString())}</span>
              </div>
            )}
             {/* Firestore timestamp handling can remain, though mock data won't have it */}
             {song.createdAt && typeof (song.createdAt as any)?.toDate === 'function' && (
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary/80 flex-shrink-0" />
                    <span className="font-medium">যুক্ত হয়েছে:</span>
                    <span>{(song.createdAt as any).toDate().toLocaleDateString('bn-BD')}</span>
                </div>
            )}
          </div>
        </CardContent>
      </Card>

      {displayLyrics && displayLyrics !== 'গানের কথা এখানে যোগ করা হবে...' && displayLyrics.trim() !== '' && displayLyrics !== 'গানের কথা পাওয়া যায়নি' && (
        <Card className="overflow-hidden shadow-lg bg-card mt-6">
          <CardHeader className="bg-secondary/10 p-6">
            <CardTitle className="text-2xl font-semibold text-primary/90 flex items-center gap-2">
              <ListMusic className="w-6 h-6 text-primary" />
              <span>গানের কথা</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Use pre-wrap for lyrics formatting */}
            <pre className="whitespace-pre-wrap text-base leading-relaxed font-sans text-foreground/90">
              {displayLyrics}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export const dynamic = 'force-dynamic'; // Ensures the page is dynamically rendered

// generateMetadata can now be correctly exported from this Server Component
export async function generateMetadata({ params }: SongPageProps) {
  try {
    const decodedSlug = decodeURIComponent(params.slug);
    // Fetch data again for metadata, or potentially cache/reuse if needed
    const song = await getSongBySlug(decodedSlug);

    if (!song) {
      return {
        title: 'গান পাওয়া যায়নি - বাংলা গান',
        description: 'আপনি যে গানটি খুঁজছেন তা পাওয়া যায়নি।',
      };
    }

    const metaTitle = cleanDisplayString(song.title) || 'শিরোনামহীন গান';
    const metaArtist = cleanDisplayString(song.artist) || 'অজানা শিল্পী';

    return {
      title: `${metaTitle} - ${metaArtist} | বাংলা গান`,
      description: `${metaTitle} গানের তথ্য ও লিরিক্স (যদি থাকে) ব্রাউজ করুন। শিল্পী: ${metaArtist}।`,
      openGraph: {
        title: `${metaTitle} - ${metaArtist} | বাংলা গান`,
        description: `গানের বিবরণ এবং লিরিক্স (যদি উপলব্ধ থাকে)।`,
      },
    };
  } catch (error) {
    console.error(`generateMetadata: Error for slug ${params.slug}:`, error);
    return {
      title: 'তথ্য লোড করতে সমস্যা - বাংলা গান',
      description: 'গানটির তথ্য এই মুহূর্তে আনা সম্ভব হচ্ছে না।',
    };
  }
}
