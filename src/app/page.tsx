// src/app/page.tsx
'use client';

import Link from 'next/link';
import SongList from '@/components/song-list';
import { getPopularSongs, getNewSongs, getTotalSongCount, getAllArtists, getAllLyricists, getAllGenres } from '@/services/bangla-song-database';
import type { Song } from '@/types/song';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Library, Feather, ListMusic, Database, WifiOff, BarChart3, Music2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toBengaliNumerals } from '@/lib/utils';
import * as React from "react";

export default function Home() {
  const [popularSongs, setPopularSongs] = React.useState<Song[]>([]);
  const [newSongs, setNewSongs] = React.useState<Song[]>([]);
  const [totalSongs, setTotalSongs] = React.useState<number | null>(null);
  const [totalArtists, setTotalArtists] = React.useState<number | null>(null);
  const [totalLyricists, setTotalLyricists] = React.useState<number | null>(null);
  const [totalGenres, setTotalGenres] = React.useState<number | null>(null);
  const [fetchError, setFetchError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      setFetchError(null);
      try {
        const [
          popSongs,
          nwSongs,
          songCount,
          artists,
          lyricists,
          genres
        ] = await Promise.all([
          getPopularSongs(),
          getNewSongs(),
          getTotalSongCount(),
          getAllArtists(),
          getAllLyricists(),
          getAllGenres(),
        ]);
        setPopularSongs(popSongs || []);
        setNewSongs(nwSongs || []);
        setTotalSongs(songCount);
        setTotalArtists(artists.length);
        setTotalLyricists(lyricists.length);
        setTotalGenres(genres.length);
      } catch (error: any) {
        console.error("Home page: Error fetching data (mock):", error);
        setFetchError("তথ্য লোড করা যায়নি। অনুগ্রহ করে পৃষ্ঠাটি রিফ্রেশ করুন।");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <ListMusic className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">তথ্য লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="text-center py-8 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 rounded-lg shadow-inner">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center mb-4">
            <Music2 className="w-12 h-12 text-primary mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-primary">
              বাংলা সংগীত সংকলন: বাংলা গানের অভিধান
            </h1>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground mt-2 max-w-3xl mx-auto">
            চর্যাপদ থেকে আধুনিক বাংলা গান – খুঁজুন, জানুন, আবিষ্কার করুন।
          </p>
        </div>
      </section>

      <Separator />

      <section>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              এক নজরে ডেটাবেস
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-border/50">
              <ListMusic className="w-8 h-8 text-primary mb-2" />
              <p className="text-2xl font-bold text-primary">
                {totalSongs !== null ? toBengaliNumerals(totalSongs) : '০'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">মোট গান</p>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-border/50">
              <Users className="w-8 h-8 text-primary mb-2" />
              <p className="text-2xl font-bold text-primary">
                {totalArtists !== null ? toBengaliNumerals(totalArtists) : '০'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">মোট শিল্পী</p>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-border/50">
              <Feather className="w-8 h-8 text-primary mb-2" />
              <p className="text-2xl font-bold text-primary">
                {totalLyricists !== null ? toBengaliNumerals(totalLyricists) : '০'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">মোট গীতিকার</p>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-border/50">
              <Library className="w-8 h-8 text-primary mb-2" />
              <p className="text-2xl font-bold text-primary">
                {totalGenres !== null ? toBengaliNumerals(totalGenres) : '০'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">মোট ধরণ</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-primary">আরও অন্বেষণ করুন</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" asChild className="justify-start text-left h-auto py-3 hover:bg-accent/50 transition-colors">
              <Link href="/songs">
                <ListMusic className="mr-2 h-4 w-4" />
                <span>সকল গান দেখুন</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start text-left h-auto py-3 hover:bg-accent/50 transition-colors">
              <Link href="/artists">
                <Users className="mr-2 h-4 w-4" />
                <span>সকল শিল্পী দেখুন</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start text-left h-auto py-3 hover:bg-accent/50 transition-colors">
              <Link href="/genres">
                <Library className="mr-2 h-4 w-4" />
                <span>সকল ধরণ দেখুন</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start text-left h-auto py-3 hover:bg-accent/50 transition-colors">
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
        {fetchError && !loading && (
          <Alert variant="destructive" className="mb-4">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>ত্রুটি</AlertTitle>
            <AlertDescription>{fetchError}</AlertDescription>
          </Alert>
        )}
         {(!loading && (popularSongs.length > 0 || newSongs.length > 0)) && !fetchError && (
          <Tabs defaultValue="popular" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:w-[400px] bg-secondary/30">
              <TabsTrigger value="popular" disabled={popularSongs.length === 0}>জনপ্রিয় গান</TabsTrigger>
              <TabsTrigger value="new" disabled={newSongs.length === 0}>নতুন রিলিজ</TabsTrigger>
            </TabsList>
            <TabsContent value="popular">
              {popularSongs.length > 0 ? (
                <SongList songs={popularSongs} title="জনপ্রিয় গান" />
              ) : (
                 <p className="text-muted-foreground py-4 text-center">কোনো জনপ্রিয় গান পাওয়া যায়নি।</p>
              )}
            </TabsContent>
            <TabsContent value="new">
              {newSongs.length > 0 ? (
                <SongList songs={newSongs} title="নতুন রিলিজ" />
              ) : (
                <p className="text-muted-foreground py-4 text-center">কোনো নতুন রিলিজ পাওয়া যায়নি।</p>
              )}
            </TabsContent>
          </Tabs>
         )}
         {!loading && !fetchError && popularSongs.length === 0 && newSongs.length === 0 && (
           <p className="text-muted-foreground text-center py-4">এখন কোনো গান উপলব্ধ নেই।</p>
         )}
      </section>
    </div>
  );
}
