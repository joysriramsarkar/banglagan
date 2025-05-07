import Link from 'next/link';
import { getAllLyricists } from '@/services/bangla-song-database';
import { Card, CardContent } from '@/components/ui/card';
import { Feather } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cleanDisplayString } from '@/lib/utils'; // Import cleanDisplayString for display

export default async function LyricistsPage() {
  // getAllLyricists returns display-ready names (spaces instead of hyphens, cleaned)
  const lyricists = await getAllLyricists();

  return (
    <div className="space-y-6">
       <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <Feather className="w-7 h-7" />
          <span>সকল গীতিকার</span>
       </h1>
       <Separator />
       <Card>
          <CardContent className="pt-6">
            {lyricists.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {lyricists.map((lyricist) => {
                  // Use the display-cleaned name for display text
                  const displayLyricist = cleanDisplayString(lyricist) || lyricist;
                  // Use the original name from getAllLyricists (which is already display-cleaned) for the query parameter
                  const queryParam = lyricist; // Use the name as returned by getAllLyricists

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
