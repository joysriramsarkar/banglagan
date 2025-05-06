import Link from 'next/link';
import { getAllLyricists } from '@/services/bangla-song-database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Feather } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default async function LyricistsPage() {
  const lyricists = await getAllLyricists();

  return (
    <div className="space-y-6">
       <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <Feather className="w-7 h-7" />
          <span>সকল গীতিকার</span>
       </h1>
       <Separator />
       <Card>
          <CardContent className="pt-6"> {/* Added padding top */}
            {lyricists.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {lyricists.map((lyricist) => (
                  <Link
                    key={lyricist}
                    href={`/search?q=${encodeURIComponent(lyricist)}`}
                    passHref
                    className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-full cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors no-underline shadow-sm border border-transparent hover:border-primary/20"
                  >
                    {lyricist}
                  </Link>
                ))}
              </div>
             ) : (
              <p className="text-muted-foreground">কোনো গীতিকার পাওয়া যায়নি।</p>
             )}
          </CardContent>
       </Card>
    </div>
  );
}

// Optional: Add metadata
export const metadata = {
  title: 'সকল গীতিকার - বাংলা গান',
  description: 'সকল বাংলা গানের গীতিকারদের তালিকা ব্রাউজ করুন।',
};
