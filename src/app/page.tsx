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
        <h1 className="text-3xl font-bold text-primary mb-4">বাংলা সঙ্গীত আবিষ্কার করুন</h1>
        <p className="text-lg text-muted-foreground">
          জনপ্রিয় হিট, নতুন রিলিজ অন্বেষণ করুন এবং আপনার প্রিয় বাংলা গানের লিরিক্স খুঁজুন।
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
    </div>
  );
}
