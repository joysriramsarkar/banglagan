// app/song/[slug]/page.tsx
import { mockSongs, type Song } from '@/services/bangla-song-database'; // Adjust path if needed and import mockSongs
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music, User, Disc3, Tag, Calendar, ListMusic, Feather } from 'lucide-react'; // Added ListMusic, Feather icons
import { createSlug, toBengaliNumerals, cleanString } from '@/lib/utils'; // Import converters and cleanString
import { Separator } from '@/components/ui/separator'; // Import Separator

// Updated function to find the song directly from the mock list
async function getSongBySlug(slug: string): Promise<Song | undefined> {
  const decodedSlug = decodeURIComponent(slug);

  // Attempt to find a match by generating slugs for each song in mockSongs
  // and comparing with the decodedSlug.
  // This approach is more robust to slight variations in how slugs might be generated or stored.
  const matchedSong = mockSongs.find(song => {
    // Clean properties before generating slugs for comparison
    const cleanTitle = cleanString(song.title) || 'untitled';
    const cleanArtist = cleanString(song.artist) || 'unknown-artist';
    const cleanLyricist = cleanString(song.lyricist); // Can be undefined

    // Try matching with lyricist if present in song data
    const slugWithLyricist = createSlug(cleanTitle, cleanArtist, cleanLyricist);
    if (slugWithLyricist === decodedSlug) {
      return true;
    }

    // Try matching without lyricist (in case the slug was generated without it or lyricist is undefined/empty)
    const slugWithoutLyricist = createSlug(cleanTitle, cleanArtist, undefined);
    if (slugWithoutLyricist === decodedSlug) {
      return true;
    }
    
    // Fallback for very old slugs that might have inconsistent formatting
    // This part can be removed if slugs are consistently generated with the new createSlug logic
    const titleSlugPart = sanitizeForFallback(cleanTitle);
    const artistSlugPart = sanitizeForFallback(cleanArtist);
    if (decodedSlug.includes(titleSlugPart) && decodedSlug.includes(artistSlugPart)) {
      // Further check if lyricist part is also there or not needed
      if (cleanLyricist) {
        const lyricistSlugPart = sanitizeForFallback(cleanLyricist);
        if (decodedSlug.includes(lyricistSlugPart)) return true;
      } else {
         // If no lyricist in song data, and slug also doesn't seem to have one
         if (!decodedSlug.includes('-lyricist-')) return true;
      }
    }


    return false;
  });

  if (!matchedSong) {
     console.warn(`No song found for decoded slug: "${decodedSlug}". Original slug: "${slug}"`);
  }
  return matchedSong;
}

// Helper for fallback matching logic - simplified sanitization
function sanitizeForFallback(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/[\s-]+/g, '-');
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

  // Clean song properties before display
  const displayTitle = cleanString(song.title) || 'শিরোনাম উপলব্ধ নেই';
  const displayArtist = cleanString(song.artist) || 'শিল্পী উপলব্ধ নেই';
  const displayLyricist = cleanString(song.lyricist);
  const displayAlbum = cleanString(song.album);
  const displayGenre = cleanString(song.genre);
  const displayLyrics = cleanString(song.lyrics);


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
          {displayLyrics && displayLyrics !== 'গানের কথা এখানে যোগ করা হবে...' && displayLyrics.trim() !== '' && (
            <Card className="overflow-hidden shadow-lg bg-card">
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
// export async function generateStaticParams() {
//   // Pre-render paths for all songs in the mock database
//   return mockSongs.map((song) => ({
//     // Ensure slugs are URL-encoded here as Next.js expects raw segment values
//     slug: encodeURIComponent(createSlug(cleanString(song.title)!, cleanString(song.artist)!, cleanString(song.lyricist))),
//   }));
// }

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

  const displayTitle = cleanString(song.title) || 'শিরোনামহীন গান';
  const displayArtist = cleanString(song.artist) || 'অজানা শিল্পী';

  return {
    title: `${displayTitle} - ${displayArtist} | বাংলা গান`,
    description: `${displayTitle} গানের তথ্য ও লিরিক্স (যদি থাকে) ব্রাউজ করুন। শিল্পী: ${displayArtist}।`,
    openGraph: {
        title: `${displayTitle} - ${displayArtist} | বাংলা গান`,
        description: `গানের বিবরণ এবং লিরিক্স (যদি উপলব্ধ থাকে)।`,
        // images: [ ... ] // Optionally add an image URL for the song
    },
  };
}
