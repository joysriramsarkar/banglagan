import Link from 'next/link'; // Import Link
import SongList from '@/components/song-list';
import SongSuggestions from '@/components/song-suggestions';
import { getPopularSongs, getNewSongs, getAllArtists, getAllGenres, getAllLyricists } from '@/services/bangla-song-database';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Library, Feather } from 'lucide-react'; // Import icons

export default async function Home() {
  // Fetch popular songs, new songs, artists, genres, and lyricists concurrently
  const [popularSongs, newSongs, artists, genres, lyricists] = await Promise.all([
    getPopularSongs(),
    getNewSongs(),
    getAllArtists(),
    getAllGenres(),
    getAllLyricists(), // Fetch lyricists
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-primary mb-4">বাংলা সঙ্গীত আবিষ্কার করুন</h1>
        <p className="text-lg text-muted-foreground">
          জনপ্রিয় হিট, নতুন রিলিজ অন্বেষণ করুন এবং আপনার প্রিয় বাংলা গানের তথ্য খুঁজুন।
        </p>
      </section>

      <Separator />

      <SongSuggestions />

      <Separator />

      <section>
        <Tabs defaultValue="popular" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="popular">জনপ্রিয় গান</TabsTrigger>
            <TabsTrigger value="new">নতুন রিলিজ</TabsTrigger>
          </TabsList>
          <TabsContent value="popular">
            <SongList songs={popularSongs} title="জনপ্রিয় গান" />
          </TabsContent>
          <TabsContent value="new">
             <SongList songs={newSongs} title="নতুন রিলিজ" />
          </TabsContent>
        </Tabs>
      </section>

      <Separator />

       {/* Artists Section */}
       <section>
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2 text-primary">
                <Users className="w-5 h-5" />
               <span>জনপ্রিয় শিল্পী</span>
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="flex flex-wrap gap-2">
               {artists.map((artist) => (
                 // Link to search results for the artist
                 <Link
                   key={artist}
                   href={`/search?q=${encodeURIComponent(artist)}`}
                   passHref
                   className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-full cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors no-underline" // Added no-underline
                 >
                   {artist}
                 </Link>
               ))}
             </div>
           </CardContent>
         </Card>
       </section>

      <Separator />

       {/* Genres Section */}
       <section>
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2 text-primary">
                <Library className="w-5 h-5" />
               <span>গানের ধরণ</span>
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="flex flex-wrap gap-2">
               {genres.map((genre) => (
                  // Link to search results for the genre
                 <Link
                   key={genre}
                   href={`/search?q=${encodeURIComponent(genre)}`}
                   passHref
                   className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-full cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors no-underline" // Added no-underline
                 >
                   {genre}
                 </Link>
               ))}
             </div>
           </CardContent>
         </Card>
       </section>

       <Separator />

       {/* Lyricists Section */}
       <section>
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2 text-primary">
                <Feather className="w-5 h-5" /> {/* Feather icon for lyricist */}
               <span>গীতিকার</span>
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="flex flex-wrap gap-2">
               {lyricists.map((lyricist) => (
                 // Link to search results for the lyricist
                 <Link
                   key={lyricist}
                   href={`/search?q=${encodeURIComponent(lyricist)}`}
                   passHref
                   className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-full cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors no-underline"
                 >
                   {lyricist}
                 </Link>
               ))}
             </div>
           </CardContent>
         </Card>
       </section>
    </div>
  );
}
