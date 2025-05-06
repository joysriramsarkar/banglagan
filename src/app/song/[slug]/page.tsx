// app/song/[slug]/page.tsx
import { mockSongs, type Song } from '@/services/bangla-song-database'; // Adjust path if needed and import mockSongs
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music, User, Disc3, Tag, Calendar } from 'lucide-react';
import { createSlug, toBengaliNumerals } from '@/lib/utils'; // Import converters

// Updated function to find the song directly from the mock list
async function getSongBySlug(slug: string): Promise<Song | undefined> {
  const decodedSlug = decodeURIComponent(slug);
  console.log(`Decoded slug: ${decodedSlug}`);

  // Find the song in the mock database whose generated slug matches the input slug
  const matchedSong = mockSongs.find(song => {
    const generatedSlug = createSlug(song.title, song.artist);
    // console.log(`Comparing ${decodedSlug} with generated ${generatedSlug} for "${song.title}"`);
    return generatedSlug === decodedSlug;
  });

  if (matchedSong) {
      console.log(`Found direct match for slug ${decodedSlug}: "${matchedSong.title}" by ${matchedSong.artist}`);
  } else {
       console.log(`No direct match found for slug: ${decodedSlug}. Consider fallback search if needed.`);
      // Optional Fallback (using previous logic if direct match fails):
      // This part can be complex and might still fail if slugs aren't perfectly stable.
      // const parts = decodedSlug.split('-by-');
      // if (parts.length === 2) {
      //   const titleQuery = parts[0].replace(/-/g, ' ').trim().toLowerCase();
      //   const artistQuery = parts[1].replace(/-/g, ' ').trim().toLowerCase();
      //   // You could try searching mockSongs again with these looser queries
      //   // matchedSong = mockSongs.find(song =>
      //   //    song.title.toLowerCase().includes(titleQuery) &&
      //   //    song.artist.toLowerCase().includes(artistQuery)
      //   // );
      // }
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
    <div className="space-y-6">
      <Card className="overflow-hidden shadow-lg bg-card">
        <CardHeader className="bg-primary/10 p-6">
          <div className="flex items-start gap-4">
            <Music className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
            <div className="flex-grow">
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
                        {/* Convert release year to Bengali numerals */}
                        <span>{toBengaliNumerals(song.releaseYear)}</span>
                    </div>
                 )}
             </div>
        </CardContent>
      </Card>
    </div>
  );
}


// Optional: Generate static paths if you have a known list of songs
export async function generateStaticParams() {
  // Pre-render paths for all songs in the mock database
  return mockSongs.map((song) => ({
    // Ensure slugs are URL-encoded here as Next.js expects raw segment values
    slug: encodeURIComponent(createSlug(song.title, song.artist)),
  }));
}
