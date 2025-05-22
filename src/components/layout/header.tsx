
import Link from 'next/link';
import Image from 'next/image'; // Import the Next.js Image component
import SearchBar from '@/components/search-bar';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            {/* Replace the Music icon with your logo */}
            <Image
              src="/logo.png" // Path to your logo in the public folder
              alt="বাংলা গান লোগো" // Alt text for accessibility
              width={32} // Specify a width (adjust as needed)
              height={32} // Specify a height (adjust as needed)
              className="h-8 w-8" // You can adjust styling here
            />
            <span className="font-bold sm:inline-block text-lg">
              বাংলা গান
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
