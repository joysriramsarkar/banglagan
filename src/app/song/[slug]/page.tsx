// app/song/[slug]/page.tsx
import { searchSongs, Song } from '@/services/bangla-song-database'; // Adjust path if needed
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Music, User } from 'lucide-react';

// Helper function to find the song based on slug parts
// This is a basic implementation and might need refinement depending on how slugs are generated
// and how robust the matching needs to be. It currently assumes a simple title-artist structure.
async function getSongBySlug(slug: string): Promise<Song | undefined> {
  // Example slug: amar-sonar-bangla-by-rabindranath-tagore
  const parts = slug.split('-by-');
  if (parts.length !== 2) return undefined;

  const titleQuery = parts[0].replace(/-/g, ' ');
  const artistQuery = parts[1].replace(/-/g, ' ');

  // We use searchSongs as a stand-in. In a real app, you'd likely have a getSongById or getSongBySlug API call.
  try {
    const results = await searchSongs(`${titleQuery} ${artistQuery}`); // Search combining parts

    // Find the best match (needs better logic in a real scenario)
    const matchedSong = results.find(
      (song) =>
        song.title.toLowerCase().includes(titleQuery) &&
        song.artist.toLowerCase().includes(artistQuery)
    );

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
          <div className="flex items-center gap-3">
            <Music className="w-8 h-8 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold text-primary">{song.title}</CardTitle>
              <CardDescription className="text-lg flex items-center gap-2 text-foreground/80 pt-1">
                 <User className="w-4 h-4" />
                 {song.artist}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-4 text-primary/90">লিরিক্স</h2>
          <Separator className="mb-4 bg-primary/20" />
          {/* Preserve whitespace and line breaks in lyrics */}
          <pre className="text-base leading-relaxed whitespace-pre-wrap font-sans text-foreground">
            {song.lyrics}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

// Optional: Generate static paths if you have a known list of songs
// export async function generateStaticParams() {
//   // Fetch all songs or a subset to pre-render
//   // const songs = await getAllSongs();
//   // return songs.map((song) => ({
//   //   slug: createSlug(song.title, song.artist),
//   // }));
//   return []; // Return empty array if not pre-rendering specific songs
// }
