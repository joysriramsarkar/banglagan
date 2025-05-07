
import Link from 'next/link';
import SongList from '@/components/song-list';
import SongSuggestions from '@/components/song-suggestions';
import { getPopularSongs, getNewSongs, seedDatabase } from '@/services/bangla-song-database'; // Import seedDatabase
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Library, Feather, ListMusic, Database } from 'lucide-react'; 

// Server Action to trigger seeding (for development only)
async function handleSeedDatabase() {
  'use server';
  try {
    console.log("Attempting to seed database from Server Action...");
    await seedDatabase();
    console.log("Database seeding initiated or completed.");
    // Revalidate pages or redirect as needed after seeding
    // For simplicity, just log success. In a real app, provide user feedback.
  } catch (error) {
    console.error("Error seeding database:", error);
    // Handle error, provide user feedback
  }
}


export default async function Home() {
  const [popularSongs, newSongs] = await Promise.all([
    getPopularSongs(),
    getNewSongs(),
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

      {/* Temporary Seed Database Button - REMOVE FOR PRODUCTION */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Database className="w-5 h-5" />
              ডেভেলপমেন্ট টুলস
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleSeedDatabase}>
              <Button type="submit" variant="destructive" className="w-full">
                ডাটাবেস সীড করুন (শুধুমাত্র ডেভেলপমেন্ট)
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2">
              এই বোতামটি ফায়ারস্টোর ডাটাবেসে নমুনা গান যুক্ত করবে। এটি শুধুমাত্র একবার ডেভেলপমেন্টের জন্য ব্যবহার করুন।
            </p>
          </CardContent>
        </Card>
      )}
      {/* End Temporary Seed Database Button */}


      <SongSuggestions />

      <Separator />

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
