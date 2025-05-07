// src/app/page.tsx
'use client';

import Link from 'next/link';
import SongList from '@/components/song-list';
import { getPopularSongs, getNewSongs } from '@/services/bangla-song-database';
import type { Song } from '@/types/song';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Library, Feather, ListMusic, Database, WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { handleSeedDatabase } from '@/lib/actions'; // Server action for seeding - not needed for mock
import * as React from "react";

export default function Home() {
  const [popularSongs, setPopularSongs] = React.useState<Song[]>([]);
  const [newSongs, setNewSongs] = React.useState<Song[]>([]);
  const [fetchError, setFetchError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadSongs() {
      setLoading(true);
      setFetchError(null);
      try {
        const [popSongs, nwSongs] = await Promise.all([
          getPopularSongs(),
          getNewSongs(),
        ]);
        setPopularSongs(popSongs || []);
        setNewSongs(nwSongs || []);
      } catch (error: any) {
        console.error("Home page: Error fetching songs (mock):", error);
        setFetchError("গানগুলি লোড করা যায়নি। অনুগ্রহ করে পৃষ্ঠাটি রিফ্রেশ করুন।");
      } finally {
        setLoading(false);
      }
    }
    loadSongs();
  }, []);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <ListMusic className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">গান লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-primary mb-4">বাংলা সঙ্গীত আবিষ্কার করুন</h1>
        <p className="text-lg text-muted-foreground">
          জনপ্রিয় হিট, নতুন রিলিজ অন্বেষণ করুন এবং আপনার প্রিয় বাংলা গানের তথ্য খুঁজুন।
        </p>
      </section>

      <Separator />

      {/* Development Tools Section Removed */}

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
        {fetchError && (
          <Alert variant="destructive" className="mb-4">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>ত্রুটি</AlertTitle>
            <AlertDescription>{fetchError}</AlertDescription>
          </Alert>
        )}
         {(popularSongs.length > 0 || newSongs.length > 0) && !fetchError && (
          <Tabs defaultValue="popular" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
              <TabsTrigger value="popular" disabled={popularSongs.length === 0}>জনপ্রিয় গান</TabsTrigger>
              <TabsTrigger value="new" disabled={newSongs.length === 0}>নতুন রিলিজ</TabsTrigger>
            </TabsList>
            <TabsContent value="popular">
              {popularSongs.length > 0 ? (
                <SongList songs={popularSongs} title="জনপ্রিয় গান" />
              ) : (
                 <p className="text-muted-foreground">কোনো জনপ্রিয় গান পাওয়া যায়নি।</p>
              )}
            </TabsContent>
            <TabsContent value="new">
              {newSongs.length > 0 ? (
                <SongList songs={newSongs} title="নতুন রিলিজ" />
              ) : (
                <p className="text-muted-foreground">কোনো নতুন রিলিজ পাওয়া যায়নি।</p>
              )}
            </TabsContent>
          </Tabs>
         )}
         {!fetchError && popularSongs.length === 0 && newSongs.length === 0 && (
           <p className="text-muted-foreground text-center py-4">এখন কোনো গান উপলব্ধ নেই।</p>
         )}
      </section>
    </div>
  );
}

