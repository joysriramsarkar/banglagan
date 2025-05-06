import SongList from '@/components/song-list';
import SongSuggestions from '@/components/song-suggestions';
import { getPopularSongs, getNewSongs, getAllArtists, getAllGenres } from '@/services/bangla-song-database';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Library } from 'lucide-react'; // Import icons

export default async function Home() {
  // Fetch popular songs, new songs, artists, and genres concurrently
  const [popularSongs, newSongs, artists, genres] = await Promise.all([
    getPopularSongs(),
    getNewSongs(),
    getAllArtists(),
    getAllGenres(),
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
                 // Later, this could link to an artist page: /artist/[artist-slug]
                 <span key={artist} className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-full cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
                   {artist}
                 </span>
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
                  // Later, this could link to a genre page: /genre/[genre-slug]
                 <span key={genre} className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-full cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
                   {genre}
                 </span>
               ))}
             </div>
           </CardContent>
         </Card>
       </section>
    </div>
  );
}
