
import Link from 'next/link';
import { getAllComposers, getTotalSongCount } from '@/services/bangla-song-database';
import { Card, CardContent } from '@/components/ui/card';
import { Disc3, ListMusic } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toBengaliNumerals } from '@/lib/utils';

export default async function ComposersPage() {
  const composers = await getAllComposers();
  const totalSongs = await getTotalSongCount();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <Disc3 className="w-7 h-7" />
          <span>সকল সুরকার</span>
        </h1>
         <div className="flex items-center gap-2 text-muted-foreground">
            <ListMusic className="w-5 h-5" />
            <span>মোট গান: {toBengaliNumerals(totalSongs)}</span>
          </div>
      </div>
      <Separator />
      <Card>
        <CardContent className="pt-6">
          {composers.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {composers.map((composerName) => (
                <Link
                  key={composerName}
                  href={`/search?q=${encodeURIComponent(composerName)}`}
                  className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-full cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors no-underline shadow-sm border border-transparent hover:border-primary/20"
                >
                  {composerName}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">কোনো সুরকার পাওয়া যায়নি।</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export const metadata = {
  title: 'সকল সুরকার - বাংলা গান',
  description: 'সকল বাংলা গানের সুরকারদের তালিকা ব্রাউজ করুন।',
};

export const revalidate = 3600; // Revalidate every hour
