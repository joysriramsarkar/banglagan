import Link from 'next/link';
import { getAllGenres } from '@/services/bangla-song-database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Library } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default async function GenresPage() {
  const genres = await getAllGenres();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
        <Library className="w-7 h-7" />
        <span>সকল গানের ধরণ</span>
      </h1>
      <Separator />
      <Card>
         <CardContent className="pt-6"> {/* Added padding top */}
           {genres.length > 0 ? (
             <div className="flex flex-wrap gap-3">
               {genres.map((genre) => (
                 <Link
                   key={genre}
                   href={`/search?q=${encodeURIComponent(genre)}`}
                   passHref
                   className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-full cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors no-underline shadow-sm border border-transparent hover:border-primary/20"
                 >
                   {genre}
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

// Optional: Add metadata
export const metadata = {
  title: 'সকল গানের ধরণ - বাংলা গান',
  description: 'বাংলা গানের বিভিন্ন ধরণ ব্রাউজ করুন।',
};
