import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Frown } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
       <Frown className="w-16 h-16 text-destructive mb-4" />
      <h2 className="text-3xl font-bold text-destructive mb-2">গান পাওয়া যায়নি</h2>
      <p className="text-muted-foreground mb-6">
        দুঃখিত, আপনি যে গানটি খুঁজছিলেন তা আমরা খুঁজে পাইনি। এটি সরানো হতে পারে বা লিঙ্কটি ভুল।
      </p>
      <Button asChild>
        <Link href="/">হোমে ফিরে যান</Link>
      </Button>
    </div>
  );
}
