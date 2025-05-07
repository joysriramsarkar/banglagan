// app/song/[slug]/page.tsx
import { getSongBySlug } from '@/services/bangla-song-database';
import type { Song } from '@/types/song';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music, User, Disc3, Tag, Calendar, ListMusic, Feather } from 'lucide-react';
import { toBengaliNumerals, cleanLyricsForDisplay, cleanDisplayString } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Frown } from 'lucide-react';
import * as React from 'react';

interface SongPageProps {
  params: {
    slug: string;
  };
}

export default async function SongPage({ params }: SongPageProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [song, setSong] = React.useState<Song | undefined>(undefined);

  React.useEffect(() => {
    async function loadSong() {
      try {
        const fetchedSong = await getSongBySlug(params.slug);
        if (!fetchedSong) {
          console.error(`Song not found for slug: ${params.slug}. Decoded: ${decodeURIComponent(params.slug)}`);
          notFound(); // Show 404 if song not found
        }
        setSong(fetchedSong);
      } catch (e: any) {
        console.error("Error fetching song:", e);
        if (e.message.includes("offline")) {
          setError("এই মুহূর্তে গানটি লোড করা যাচ্ছে না। অনুগ্রহ করে ইন্টারনেট সংযোগ পরীক্ষা করুন।");
        } else {
          setError("গানটি লোড করতে সমস্যা হচ্ছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।");
        }
      }
    }

    loadSong();
  }, [params.slug]);

  // Use cleaned display strings for display
  const displayTitle = song ? cleanDisplayString(song.title) || 'শিরোনাম উপলব্ধ নেই' : 'শিরোনাম লোড হচ্ছে...';
  const displayArtist = song ? cleanDisplayString(song.artist) || 'শিল্পী উপলব্ধ নেই' : 'শিল্পী লোড হচ্ছে...';
  const displayLyricist = song ? cleanDisplayString(song.lyricist) : undefined;
  const displayAlbum = song ? cleanDisplayString(song.album) : undefined;
  const displayGenre = song ? cleanDisplayString(song.genre) : undefined;
  const displayLyrics = song ? cleanLyricsForDisplay(song.lyrics) : undefined;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Alert variant="destructive">
          <Frown className="h-4 w-4" />
          <AlertTitle>ত্রুটি</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p> গান লোড হচ্ছে...</p>
      </div>
    );
  }

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
                        <Disc3 className="w-5 h-5 text-primary/80 flex-shrink-0"/>
                        <span className="font-medium">অ্যালবাম:</span>
                        <span>{displayAlbum}</span>
                    </div>
                )}
                {displayGenre && (
                    <div className="flex items-center gap-2">
                        <Tag className="w-5 h-5 text-primary/80 flex-shrink-0"/>
                        <span className="font-medium">ধরণ:</span>
                        <span>{displayGenre}</span>
                    </div>
                 )}
                 {song.releaseYear && (
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary/80 flex-shrink-0"/>
                        <span className="font-medium">প্রকাশের বছর:</span>
                        <span>{toBengaliNumerals(song.releaseYear)}</span>
                    </div>
                 )}
             </div>
        </CardContent>

          {displayLyrics && displayLyrics !== 'গানের কথা এখানে যোগ করা হবে...' && displayLyrics.trim() !== '' && displayLyrics !== 'গানের কথা পাওয়া যায়নি' && (
            <Card className="overflow-hidden shadow-lg bg-card mt-6">
              <CardHeader className="bg-secondary/10 p-6">
                <CardTitle className="text-2xl font-semibold text-primary/90 flex items-center gap-2">
                  <ListMusic className="w-6 h-6 text-primary" />
                  <span>গানের কথা</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <pre className="whitespace-pre-wrap text-base leading-relaxed font-sans text-foreground/90">
                  {displayLyrics}
                </pre>
              </CardContent>
            </Card>
          )}
      </Card>
    </div>
  );
}

export const dynamic = 'auto';
export const revalidate = 3600; // Revalidate hourly

export async function generateMetadata({ params }: SongPageProps) {
  const song = await getSongBySlug(params.slug);

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
}

// Firestore does not easily support generating all slugs at build time for large datasets.
// We will rely on dynamic rendering and on-demand fetching.
// export async function generateStaticParams() {
//   // This would be too slow for many songs with Firestore.
//   // Consider a different approach if full SSG for all songs is a hard requirement.
//   return [];
// }
