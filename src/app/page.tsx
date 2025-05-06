import Link from 'next/link';
import SongList from '@/components/song-list';
import SongSuggestions from '@/components/song-suggestions';
import { getPopularSongs, getNewSongs } from '@/services/bangla-song-database';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // Import Button
import { Users, Library, Feather, ListMusic } from 'lucide-react'; // Import icons including ListMusic

export default async function Home() {
  // Fetch popular songs and new songs concurrently
  const [popularSongs, newSongs] = await Promise.all([
    getPopularSongs(),
    getNewSongs(),
    // Removed fetching all artists, genres, lyricists here
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

       {/* Explore Section */}
       <section>
           <Card>
             <CardHeader>
               <CardTitle className="text-primary">আরও অন্বেষণ করুন</CardTitle>
             </CardHeader>
             <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               <Button variant="outline" asChild className="justify-start text-left h-auto py-3">
                 <Link href="/songs">
                   <ListMusic className="mr-2 h-4 w-4" />
                   <span>সকল গান দেখুন</span>
                 </Link>
               </Button>
               <Button variant="outline" asChild className="justify-start text-left h-auto py-3">
                 <Link href="/artists">
                   <Users className="mr-2 h-4 w-4" />
                   <span>সকল শিল্পী দেখুন</span>
                 </Link>
               </Button>
               <Button variant="outline" asChild className="justify-start text-left h-auto py-3">
                 <Link href="/genres">
                    <Library className="mr-2 h-4 w-4" />
                   <span>সকল ধরণ দেখুন</span>
                 </Link>
               </Button>
               <Button variant="outline" asChild className="justify-start text-left h-auto py-3">
                 <Link href="/lyricists">
                   <Feather className="mr-2 h-4 w-4" />
                   <span>সকল গীতিকার দেখুন</span>
                 </Link>
               </Button>
             </CardContent>
           </Card>
         </section>


      <Separator />

      {/* Popular and New Songs Section */}
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

      {/* Removed detailed Artists, Genres, and Lyricists sections */}

    </div>
  );
}
