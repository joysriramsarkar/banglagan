// app/song/[slug]/page.tsx
import { searchSongs, Song } from '@/services/bangla-song-database'; // Adjust path if needed
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Music, User, Disc3, Tag, Calendar } from 'lucide-react'; // Import new icons

// Helper function to find the song based on slug parts
// Improved to handle potential encoding issues and provide better matching
async function getSongBySlug(slug: string): Promise<Song | undefined> {
  // Decode the slug in case of URL encoding issues with Bengali characters
  const decodedSlug = decodeURIComponent(slug);

  // Example slug: আমার-সোনার-বাংলা-by-রবীন্দ্রনাথ-ঠাকুর
  // Split by a unique separator, assuming '-by-' structure
  const parts = decodedSlug.split('-by-');
  if (parts.length !== 2) {
      console.warn(`Unexpected slug format: ${decodedSlug}`);
      // Fallback: try searching with the whole slug as a title query
      try {
          const results = await searchSongs(decodedSlug.replace(/-/g, ' '));
          // If there's an exact title match (or a close one), return it
          return results.find(song => song.title.toLowerCase() === decodedSlug.replace(/-/g, ' ').toLowerCase()) || results[0];
      } catch (error) {
          console.error("Error in fallback search:", error);
          return undefined;
      }
  }

  const titleQuery = parts[0].replace(/-/g, ' ').toLowerCase();
  const artistQuery = parts[1].replace(/-/g, ' ').toLowerCase();

  try {
    // Search combining parts for better initial filtering
    // Note: searchSongs might need adjustment if it doesn't search artists effectively enough alone
    const results = await searchSongs(`${titleQuery} ${artistQuery}`);

    // Find the best match: Prioritize exact matches, then close matches.
    // Normalize strings for comparison (lowercase and trim)
    const matchedSong = results.find(
      (song) =>
        song.title.toLowerCase().trim() === titleQuery &&
        song.artist.toLowerCase().trim() === artistQuery
    );

    // If no exact match, try a less strict find (e.g., includes) as a fallback
    if (!matchedSong) {
        console.log(`No exact match for slug: ${decodedSlug}. Trying partial match.`);
        const partialMatch = results.find(
            (song) =>
                song.title.toLowerCase().includes(titleQuery) &&
                song.artist.toLowerCase().includes(artistQuery)
        );
        // If still no match, perhaps return the first result if the search was reasonably specific
        return partialMatch || (results.length === 1 ? results[0] : undefined);
    }


    return matchedSong;
  } catch (error) {
    console.error("Error fetching song by slug:", error);
    return undefined; // Return undefined on error
  }
}

interface SongPageProps {
  params: {
    slug: string;
  };
}

export default async function SongPage({ params }: SongPageProps) {
  const song = await getSongBySlug(params.slug);

  if (!song) {
    notFound(); // Show 404 if song not found
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden shadow-lg bg-card">
        <CardHeader className="bg-primary/10 p-6">
          <div className="flex items-start gap-4"> {/* Adjusted alignment */}
            <Music className="w-8 h-8 text-primary mt-1 flex-shrink-0" /> {/* Added mt-1 and flex-shrink-0 */}
            <div className="flex-grow"> {/* Added flex-grow */}
              <CardTitle className="text-3xl font-bold text-primary mb-1">{song.title}</CardTitle>
              <CardDescription className="text-lg flex items-center gap-2 text-foreground/80 pt-1">
                 <User className="w-4 h-4 flex-shrink-0" />
                 <span>{song.artist}</span>
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
                        <span>{song.releaseYear}</span>
                    </div>
                 )}
             </div>

          {/* Lyrics Section Removed as per request */}
          {/*
          <h2 className="text-2xl font-semibold mb-4 text-primary/90">লিরিক্স</h2>
          <Separator className="mb-4 bg-primary/20" />
          <pre className="text-base leading-relaxed whitespace-pre-wrap font-sans text-foreground">
            {song.lyrics}
          </pre>
          */}
        </CardContent>
      </Card>
    </div>
  );
}


// Helper function to create slugs (consider moving to a utility file)
// Handles basic replacement, might need more robust logic for complex names
const createSlug = (title: string, artist: string) => {
    const titleSlug = title.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, '-');
    const artistSlug = artist.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, '-');
    // Ensure slugs are not empty
    return `${titleSlug || 'untitled'}-by-${artistSlug || 'unknown-artist'}`;
};


// Optional: Generate static paths if you have a known list of songs
// export async function generateStaticParams() {
//   // Fetch all songs or a subset to pre-render
//   // const songs = await getAllSongs(); // You'd need a function like this
//   // return songs.map((song) => ({
//   //   slug: createSlug(song.title, song.artist),
//   // }));
//   return []; // Return empty array if not pre-rendering specific songs
// }
