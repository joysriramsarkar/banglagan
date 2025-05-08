'use server'; // Keep 'use server' if server-side logic like direct DB access is intended, or remove if it's a standard Server Component

import { getSongBySlug } from '@/services/bangla-song-database';
import type { Song } from '@/services/bangla-song-database';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music, User, Disc3, Tag, Calendar, ListMusic, Feather, Info, WifiOff } from 'lucide-react';
import { toBengaliNumerals, cleanLyricsForDisplay, cleanDisplayString } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import * as React from 'react'; // React import might not be strictly necessary for Server Components unless using JSX

interface SongPageServerProps {
  params: { slug: string };
}

export default async function SongPage({ params }: SongPageServerProps) {
  let decodedSlug: string;
  const rawSlug = params?.slug;

  if (!rawSlug || typeof rawSlug !== 'string' || rawSlug.trim() === '') {
    console.error("Server-side: No valid slug provided in params.");
    // Or handle as a specific error, for now, we'll let it flow to notFound if getSongBySlug fails
    notFound(); // Or throw new Error("Invalid slug");
  }

  try {
    decodedSlug = decodeURIComponent(rawSlug);
  } catch (e) {
    console.warn(`Server-side: Error decoding slug "${rawSlug}", using as is. Error:`, e);
    decodedSlug = rawSlug;
  }

  let song: Song | undefined;
  let fetchError: string | null = null;

  try {
    song = await getSongBySlug(decodedSlug);
  } catch (e: any) {
    console.error(`Server-side: Error fetching song for decoded slug "${decodedSlug}":`, e);
    // This type of error should ideally be handled by an error.js boundary
    // For now, we can display a generic error message
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <Alert variant="destructive" className="max-w-md">
                <WifiOff className="h-5 w-5" />
                <AlertTitle>ত্রুটি</AlertTitle>
                <AlertDescription>গানটি লোড করার সময় একটি সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।</AlertDescription>
            </Alert>
        </div>
    );
  }

  if (!song) {
    console.warn(`Server-side: Song not found for decoded slug: ${decodedSlug}. Raw slug: ${rawSlug}`);
    notFound(); // Triggers the not-found.tsx component
  }

  // Song data is available here
  const displayTitle = cleanDisplayString(song.title)?.replace(/-/g, ' ') || 'শিরোনাম উপলব্ধ নেই';
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
                {displayLyricist && displayLyricist !== 'সংগৃহীত' && displayLyricist !== 'অজানা গীতিকার' && displayLyricist !== 'অজানা-গীতিকার' && (
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
          <h2 className="text-2xl font-semibold text-primary/90 border-b pb-2 mb-4 flex items-center">
            <Info className="w-5 h-5 mr-2 text-primary/80" />
            গানের তথ্য
          </h2>
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
          </div>
        </CardContent>
      </Card>

      {displayLyrics && displayLyrics !== 'গানের কথা পাওয়া যায়নি' && displayLyrics.trim() !== '' && (
        <Card className="overflow-hidden shadow-lg bg-card mt-6">
          <CardHeader className="bg-secondary/10 p-6">
            <CardTitle className="text-2xl font-semibold text-primary/90 flex items-center gap-2">
              <ListMusic className="w-6 h-6 text-primary" />
              <span>গানের কথা</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div
              className="whitespace-pre-wrap text-base leading-relaxed font-sans text-foreground/90"
              style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              {displayLyrics}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// export const dynamic = 'force-dynamic'; // Ensures the page is dynamically rendered, might not be needed if data fetching itself is dynamic.
