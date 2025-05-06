'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = React.useState('');

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (query.trim()) {
      // Store search query in localStorage for history
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      history.unshift(query.trim()); // Add to the beginning
      // Keep only the last 5 searches (adjust as needed)
      const uniqueHistory = Array.from(new Set(history)).slice(0, 5);
      localStorage.setItem('searchHistory', JSON.stringify(uniqueHistory));

      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-md">
      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="গান, শিল্পী, গীতিকার অনুসন্ধান করুন..." // Updated placeholder
        className="w-full rounded-lg bg-background pl-8 pr-16" // Added padding for button
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="গান, শিল্পী বা গীতিকার অনুসন্ধান করুন"
      />
      <Button type="submit" size="sm" className="absolute right-1 top-1/2 h-8 -translate-y-1/2">
        অনুসন্ধান
      </Button>
    </form>
  );
}
