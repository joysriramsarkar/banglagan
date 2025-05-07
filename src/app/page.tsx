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
import { handleSeedDatabase } from '@/lib/actions';
import * as React from "react";

export default async function Home() {
  let popularSongs: Song[] = [];
  let newSongs: Song[] = [];
  let fetchError: string | null = null;

  try {
    [popularSongs, newSongs] = await Promise.all([
      getPopularSongs(),
      getNewSongs(),
    ]);
  } catch (error: any) {
    console.error("Home page: Error fetching songs:", error);
    let message = "গানগুলি লোড করা যায়নি।";
    if (error.message?.toLowerCase().includes('offline') || error.code === 'unavailable') {
      message = "গানগুলি লোড করা যায়নি কারণ আপনি অফলাইনে আছেন।";
    }
    fetchError = message;
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
              এই বোতামটি ফায়ারস্টোর ডাটাবেসে নমুনা গান যুক্ত করবে। এটি শুধুমাত্র একবার ডেভেলপমেন্টের জন্য ব্যবহার করুন।
            </p>
          </CardContent>
        </Card>
      )}
      
      

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
        {fetchError && (
          <Alert variant="destructive" className="mb-4">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>তথ্য আনতে সমস্যা</AlertTitle>
            <AlertDescription>{fetchError}</AlertDescription>
          </Alert>
        )}
        {(popularSongs.length > 0 || newSongs.length > 0) && (
          <Tabs defaultValue="popular" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
              <TabsTrigger value="popular" disabled={popularSongs.length === 0}>জনপ্রিয় গান</TabsTrigger>
              <TabsTrigger value="new" disabled={newSongs.length === 0}>নতুন রিলিজ</TabsTrigger>
            </TabsList>
            <TabsContent value="popular">
              {popularSongs.length > 0 ? (
                <SongList songs={popularSongs} title="জনপ্রিয় গান" />
              ) : (
                !fetchError && <p className="text-muted-foreground">কোনো জনপ্রিয় গান পাওয়া যায়নি।</p>
              )}
            </TabsContent>
            <TabsContent value="new">
               {newSongs.length > 0 ? (
                <SongList songs={newSongs} title="নতুন রিলিজ" />
               ) : (
                !fetchError && <p className="text-muted-foreground">কোনো নতুন রিলিজ পাওয়া যায়নি।</p>
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

