
import Link from 'next/link';
import { getAllArtists, getTotalSongCount } from '@/services/bangla-song-database'; 
import { Card, CardContent } from '@/components/ui/card';
import { Users, ListMusic } from 'lucide-react'; 
import { Separator } from '@/components/ui/separator';
import { toBengaliNumerals } from '@/lib/utils'; 

export default async function ArtistsPage() {
  // getAllArtists now returns display-ready, individual artist names
  const artists = await getAllArtists();
  const totalSongs = await getTotalSongCount(); 

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <Users className="w-7 h-7" />
          <span>সকল শিল্পী</span>
        </h1>
         <div className="flex items-center gap-2 text-muted-foreground">
            <ListMusic className="w-5 h-5" />
            <span>মোট গান: {toBengaliNumerals(totalSongs)}</span>
          </div>
      </div>
      <Separator />
      <Card>
        <CardContent className="pt-6">
          {artists.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {artists.map((artistName) => ( // artistName is now a clean, individual name
                <Link
                  key={artistName} 
                  href={`/search?q=${encodeURIComponent(artistName)}`} 
                  passHref
                  className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-full cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors no-underline shadow-sm border border-transparent hover:border-primary/20"
                >
                  {artistName} 
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">কোনো শিল্পী পাওয়া যায়নি।</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export const metadata = {
  title: 'সকল শিল্পী - বাংলা গান',
  description: 'সকল বাংলা গানের শিল্পীদের তালিকা ব্রাউজ করুন।',
};

export const revalidate = 3600; // Revalidate every hour

