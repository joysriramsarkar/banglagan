
import Link from 'next/link';
import { getAllGenres, getTotalSongCount } from '@/services/bangla-song-database'; // Import getTotalSongCount
import { Card, CardContent } from '@/components/ui/card';
import { Library, ListMusic } from 'lucide-react'; // Import ListMusic icon
import { Separator } from '@/components/ui/separator';
import { cleanDisplayString, toBengaliNumerals } from '@/lib/utils'; // Import cleanDisplayString and toBengaliNumerals

export default async function GenresPage() {
  const genres = await getAllGenres();
  const totalSongs = await getTotalSongCount(); // Fetch total song count

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
             <Library className="w-7 h-7" />
             <span>সকল গানের ধরণ</span>
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
           {genres.length > 0 ? (
             <div className="flex flex-wrap gap-3">
               {genres.map((genre) => (
                 <Link
                   key={genre}
                   href={`/search?q=${encodeURIComponent(genre)}`}
                   className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-full cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors no-underline shadow-sm border border-transparent hover:border-primary/20"
                 >
                   {genre} {/* Display genre name (already cleaned) */}
                 </Link>
               ))}
             </div>
            ) : (
             <p className="text-muted-foreground">কোনো গানের ধরণ পাওয়া যায়নি।</p>
            )}
         </CardContent>
      </Card>
    </div>
  );
}

export const metadata = {
  title: 'সকল গানের ধরণ - বাংলা গান',
  description: 'বাংলা গানের বিভিন্ন ধরণ ব্রাউজ করুন।',
};

export const revalidate = 3600; // Revalidate every hour
