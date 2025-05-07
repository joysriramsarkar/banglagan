
import Link from 'next/link';
import { getAllArtists } from '@/services/bangla-song-database';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cleanDisplayString } from '@/lib/utils'; // Import cleanDisplayString

export default async function ArtistsPage() {
  const artists = await getAllArtists();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
        <Users className="w-7 h-7" />
        <span>সকল শিল্পী</span>
      </h1>
      <Separator />
      <Card>
        <CardContent className="pt-6">
          {artists.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {artists.map((artist) => (
                <Link
                  key={artist}
                  href={`/search?q=${encodeURIComponent(artist)}`}
                  passHref
                  className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-full cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors no-underline shadow-sm border border-transparent hover:border-primary/20"
                >
                  {cleanDisplayString(artist) || artist} {/* Display cleaned name */}
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
