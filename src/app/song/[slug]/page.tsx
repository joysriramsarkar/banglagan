// app/song/[slug]/page.tsx
import { mockSongs, type Song } from '@/services/bangla-song-database';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music, User, Disc3, Tag, Calendar, ListMusic, Feather } from 'lucide-react';
import { createSlug, toBengaliNumerals, cleanString } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

async function getSongBySlug(slug: string): Promise<Song | undefined> {
  const decodedSlug = decodeURIComponent(slug);
  console.log(`getSongBySlug: received slug "${slug}", decoded: "${decodedSlug}"`);

  // Attempt to find a match by generating slugs for each song in mockSongs
  // and comparing with the decodedSlug.
  const matchedSong = mockSongs.find(song => {
    // IMPORTANT: Use the exact same cleaning and slug generation logic as used for link creation
    const songTitleForSlug = cleanString(song.title);
    const songArtistForSlug = cleanString(song.artist);
    const songLyricistForSlug = cleanString(song.lyricist); // Can be undefined

    // Generate slug using the same method as in SongCard/SongList
    const currentSongSlug = createSlug(songTitleForSlug, songArtistForSlug, songLyricistForSlug);
    
    // console.log(`Comparing decodedSlug "${decodedSlug}" with generated slug "${currentSongSlug}" for song "${song.title}"`);

    if (currentSongSlug === decodedSlug) {
      return true;
    }
    
    // Fallback for cases where lyricist might be part of the slug but not consistently in the data
    // or vice-versa. This attempts to match the most common patterns.
    const slugWithoutLyricistPart = createSlug(songTitleForSlug, songArtistForSlug, undefined);
     if (slugWithoutLyricistPart === decodedSlug) {
       console.log(`Fallback match (no lyricist) for "${decodedSlug}" with song "${song.title}"`);
       return true;
     }

    // A more direct comparison for simple cases, if the above fails
    // This is less robust but can catch simple title-artist matches
    const simpleExpectedSlug = `${cleanString(song.title)?.toLowerCase()}-by-${cleanString(song.artist)?.toLowerCase()}`;
    if (decodedSlug.startsWith(simpleExpectedSlug)) {
        // Check if lyricist part is also consistent if present
        if (song.lyricist) {
            const lyricistPart = `-lyricist-${cleanString(song.lyricist)?.toLowerCase()}`;
            if (decodedSlug === `${simpleExpectedSlug}${lyricistPart}`) {
                 console.log(`Fallback simple match (with lyricist) for "${decodedSlug}" with song "${song.title}"`);
                return true;
            }
        } else if (decodedSlug === simpleExpectedSlug) { // No lyricist in data and slug
             console.log(`Fallback simple match (no lyricist) for "${decodedSlug}" with song "${song.title}"`);
            return true;
        }
    }


    return false;
  });

  if (!matchedSong) {
     console.warn(`No song found for decoded slug: "${decodedSlug}". Original slug: "${slug}"`);
     // Optional: Log a few generated slugs from mockSongs to help debug
     // For example, log the first 5 generated slugs:
     // mockSongs.slice(0, 5).forEach(s => {
     //   console.log(`Sample generated slug: ${createSlug(cleanString(s.title), cleanString(s.artist), cleanString(s.lyricist))}`);
     // });
  }
  return matchedSong;
}


interface SongPageProps {
  params: {
    slug: string;
  };
}

export default async function SongPage({ params }: SongPageProps) {
  const song = await getSongBySlug(params.slug);

  if (!song) {
    console.error(`Song not found for slug: ${params.slug}. Decoded: ${decodeURIComponent(params.slug)}`);
    notFound(); // Show 404 if song not found
  }

  // Clean song properties before display, ensuring undefined is handled gracefully
  const displayTitle = song.title || 'শিরোনাম উপলব্ধ নেই';
  const displayArtist = song.artist || 'শিল্পী উপলব্ধ নেই';
  const displayLyricist = song.lyricist; // cleanString handles undefined
  const displayAlbum = song.album;
  const displayGenre = song.genre;
  const displayLyrics = song.lyrics;


  return (
    <div className="space-y-8"> {/* Increased spacing */}
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
                  {/* Display Lyricist if available */}
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
                        {/* Convert release year to Bengali numerals */}
                        <span>{toBengaliNumerals(song.releaseYear)}</span>
                    </div>
                 )}
             </div>
        </CardContent>

          {/* Lyrics Section */}
          {displayLyrics && displayLyrics !== 'গানের কথা এখানে যোগ করা হবে...' && displayLyrics.trim() !== '' && displayLyrics !== 'গানের কথা পাওয়া যায়নি' && (
            <Card className="overflow-hidden shadow-lg bg-card mt-6">
              <CardHeader className="bg-secondary/10 p-6">
                <CardTitle className="text-2xl font-semibold text-primary/90 flex items-center gap-2">
                  <ListMusic className="w-6 h-6 text-primary" />
                  <span>গানের কথা</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Use pre for preserving whitespace and line breaks */}
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


// Removed generateStaticParams to speed up build times.
// Pages will be dynamically rendered.

export const dynamic = 'auto'; // Default, can be 'force-dynamic' if needed or 'error'
export const revalidate = 3600; // Revalidate hourly, or adjust as needed

// Function to generate metadata dynamically
export async function generateMetadata({ params }: SongPageProps) {
  const song = await getSongBySlug(params.slug);

  if (!song) {
    return {
      title: 'গান পাওয়া যায়নি - বাংলা গান',
      description: 'আপনি যে গানটি খুঁজছেন তা পাওয়া যায়নি।',
    };
  }

  const metaTitle = song.title || 'শিরোনামহীন গান';
  const metaArtist = song.artist || 'অজানা শিল্পী';

  return {
    title: `${metaTitle} - ${metaArtist} | বাংলা গান`,
    description: `${metaTitle} গানের তথ্য ও লিরিক্স (যদি থাকে) ব্রাউজ করুন। শিল্পী: ${metaArtist}।`,
    openGraph: {
        title: `${metaTitle} - ${metaArtist} | বাংলা গান`,
        description: `গানের বিবরণ এবং লিরিক্স (যদি উপলব্ধ থাকে)।`,
        // images: [ ... ] // Optionally add an image URL for the song
    },
  };
}
