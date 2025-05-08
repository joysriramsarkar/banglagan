
import Link from 'next/link';
import { getAllLyricists, getTotalSongCount } from '@/services/bangla-song-database'; // Import getTotalSongCount
import { Card, CardContent } from '@/components/ui/card';
import { Feather, ListMusic } from 'lucide-react'; // Import ListMusic icon
import { Separator } from '@/components/ui/separator';
import { cleanDisplayString, toBengaliNumerals } from '@/lib/utils'; // Import utilities

export default async function LyricistsPage() {
  // getAllLyricists returns display-ready names (spaces instead of hyphens, cleaned)
  const lyricists = await getAllLyricists();
  const totalSongs = await getTotalSongCount(); // Fetch total song count

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
             <Feather className="w-7 h-7" />
             <span>সকল গীতিকার</span>
          </h1>
           {/* Display total song count */}
           <div className="flex items-center gap-2 text-muted-foreground">
             <ListMusic className="w-5 h-5" />
             <span>মোট গান: {toBengaliNumerals(totalSongs)}</span>
           </div>
       </div>
       <Separator />
       <Card>
          <CardContent className="pt-6">
            {lyricists.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {lyricists.map((lyricist) => {
                  // Use the display-cleaned name for display text and query parameter
                  const displayLyricist = lyricist; // Name is already cleaned by getAllLyricists
                  const queryParam = lyricist;

                  return (
                    <Link
                      key={queryParam} // Use the queryParam as key for uniqueness
                      href={`/search?q=${encodeURIComponent(queryParam)}`} // Encode the potentially space-separated name
                      className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-full cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors no-underline shadow-sm border border-transparent hover:border-primary/20"
                    >
                      {displayLyricist} {/* Display the cleaned name */}
                    </Link>
                  );
                })}
              </div>
             ) : (
              <p className="text-muted-foreground">কোনো গীতিকার পাওয়া যায়নি।</p>
             )}
          </CardContent>
       </Card>
    </div>
  );
}

export const metadata = {
  title: 'সকল গীতিকার - বাংলা গান',
  description: 'সকল বাংলা গানের গীতিকারদের তালিকা ব্রাউজ করুন।',
};

export const revalidate = 3600; // Revalidate every hour
