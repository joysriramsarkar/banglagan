// app/song/[slug]/page.tsx
import { mockSongs, type Song } from '@/services/bangla-song-database'; // Adjust path if needed and import mockSongs
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music, User, Disc3, Tag, Calendar, ListMusic, Feather } from 'lucide-react'; // Added ListMusic, Feather icons
import { createSlug, toBengaliNumerals } from '@/lib/utils'; // Import converters
import { Separator } from '@/components/ui/separator'; // Import Separator

// Updated function to find the song directly from the mock list
async function getSongBySlug(slug: string): Promise<Song | undefined> {
  const decodedSlug = decodeURIComponent(slug);
  // console.log(`Decoded slug: ${decodedSlug}`); // Keep for debugging if needed

  // Find the song in the mock database whose generated slug matches the input slug
  const matchedSong = mockSongs.find(song => {
    // Pass lyricist to createSlug if available, otherwise pass undefined
    const generatedSlug = createSlug(song.title, song.artist, song.lyricist);
    // console.log(`Comparing ${decodedSlug} with generated ${generatedSlug} for "${song.title}"`); // Keep for debugging if needed
    return generatedSlug === decodedSlug;
  });

  if (matchedSong) {
      // console.log(`Found direct match for slug ${decodedSlug}: "${matchedSong.title}" by ${matchedSong.artist}`); // Keep for debugging if needed
  } else {
       console.log(`No direct match found for slug: ${decodedSlug}. Consider fallback search if needed.`);
      // Optional Fallback can be added here if necessary
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

  return (
    <div className="space-y-8"> {/* Increased spacing */}
      <Card className="overflow-hidden shadow-lg bg-card">
        <CardHeader className="bg-primary/10 p-6">
          <div className="flex items-start gap-4">
            <Music className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
            <div className="flex-grow">
              <CardTitle className="text-3xl font-bold text-primary mb-1">{song.title}</CardTitle>
              <CardDescription className="text-lg text-foreground/80 pt-1 space-y-1">
                 <div className="flex items-center gap-2">
                     <User className="w-4 h-4 flex-shrink-0" />
                     <span>{song.artist}</span>
                 </div>
                  {/* Display Lyricist if available */}
                  {song.lyricist && song.lyricist !== 'সংগৃহীত' && song.lyricist !== 'অজানা গীতিকার' && (
                    <div className="flex items-center gap-2 text-sm">
                      <Feather className="w-4 h-4 flex-shrink-0" />
                      <span>গীতিকার: {song.lyricist}</span>
                    </div>
                  )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
           <h2 className="text-2xl font-semibold text-primary/90 border-b pb-2 mb-4">গানের তথ্য</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-base text-foreground/90">
                 {song.album && (
                    <div className="flex items-center gap-2">
                        <Disc3 className="w-5 h-5 text-primary/80 flex-shrink-0"/>
                        <span className="font-medium">অ্যালবাম:</span>
                        <span>{song.album}</span>
                    </div>
                )}
                {song.genre && (
                    <div className="flex items-center gap-2">
                        <Tag className="w-5 h-5 text-primary/80 flex-shrink-0"/>
                        <span className="font-medium">ধরণ:</span>
                        <span>{song.genre}</span>
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
                 {/* Lyricist information again if needed, or just keep in description */}
                 {/* {song.lyricist && (
                    <div className="flex items-center gap-2">
                        <Feather className="w-5 h-5 text-primary/80 flex-shrink-0"/>
                        <span className="font-medium">গীতিকার:</span>
                        <span>{song.lyricist}</span>
                    </div>
                 )} */}
             </div>
        </CardContent>
      </Card>

      {/* Lyrics Section */}
      {song.lyrics && song.lyrics !== 'গানের কথা এখানে যোগ করা হবে...' && ( // Check if lyrics exist and are not placeholder
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
                    {song.lyrics}
                </pre>
            </CardContent>
        </Card>
      )}
    </div>
  );
}


// Optional: Generate static paths if you have a known list of songs
export async function generateStaticParams() {
  // Pre-render paths for all songs in the mock database
  return mockSongs.map((song) => ({
    // Ensure slugs are URL-encoded here as Next.js expects raw segment values
    slug: encodeURIComponent(createSlug(song.title, song.artist, song.lyricist)),
  }));
}
