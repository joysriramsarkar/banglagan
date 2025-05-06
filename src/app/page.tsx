import SongList from '@/components/song-list';
import SongSuggestions from '@/components/song-suggestions';
import { getPopularSongs, getNewSongs } from '@/services/bangla-song-database';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export default async function Home() {
  // Fetch popular and new songs concurrently
  const [popularSongs, newSongs] = await Promise.all([
    getPopularSongs(),
    getNewSongs(),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-primary mb-4">Discover Bengali Music</h1>
        <p className="text-lg text-muted-foreground">
          Explore popular hits, new releases, and find lyrics for your favorite Bangla songs.
        </p>
      </section>

      <Separator />

      <SongSuggestions />

      <Separator />

      <section>
        <Tabs defaultValue="popular" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="popular">Popular Songs</TabsTrigger>
            <TabsTrigger value="new">New Releases</TabsTrigger>
          </TabsList>
          <TabsContent value="popular">
            <SongList songs={popularSongs} title="Popular Songs" />
          </TabsContent>
          <TabsContent value="new">
             <SongList songs={newSongs} title="New Releases" />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
