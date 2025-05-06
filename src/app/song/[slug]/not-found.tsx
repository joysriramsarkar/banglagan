import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Frown } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
       <Frown className="w-16 h-16 text-destructive mb-4" />
      <h2 className="text-3xl font-bold text-destructive mb-2">Song Not Found</h2>
      <p className="text-muted-foreground mb-6">
        Sorry, we couldn't find the song you were looking for. It might have been moved or the link is incorrect.
      </p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
