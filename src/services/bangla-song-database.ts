/**
 * Represents a song with title, artist, album, genre, release year, and lyrics.
 */
export interface Song {
  /**
   * The title of the song in Bengali.
   * গানের শিরোনাম (বাংলায়)।
   */
  title: string;
  /**
   * The artist of the song in Bengali.
   * শিল্পীর নাম (বাংলায়)।
   */
  artist: string;
  /**
   * The album the song belongs to (optional).
   * অ্যালবামের নাম (যদি থাকে)।
   */
  album?: string;
  /**
   * The genre of the song (optional).
   * গানের ধরণ (যদি থাকে)।
   */
  genre?: string;
   /**
   * The release year of the song (optional).
   * প্রকাশের বছর (যদি থাকে)।
   */
  releaseYear?: number;
  /**
   * The lyrics of the song.
   * গানের কথা।
   */
  lyrics: string; // Keep lyrics in the data model, but won't display on page for now
}

// Larger mock database with Bengali titles and artists and additional info
export const mockSongs: Song[] = [ // Export the array
  {
    title: 'আমার সোনার বাংলা',
    artist: 'রবীন্দ্রনাথ ঠাকুর',
    album: 'গীতবিতান',
    genre: 'স্বদেশ',
    releaseYear: 1905,
    lyrics: `আমার সোনার বাংলা, আমি তোমায় ভালোবাসি।
চিরদিন তোমার আকাশ, তোমার বাতাস, আমার প্রাণে বাজায় বাঁশি॥
ও মা, ফাগুনে তোর আমের বনে ঘ্রাণে পাগল করে,
মরি হায়, হায় রে—
ও মা, অঘ্রানে তোর ভরা ক্ষেতে আমি কী দেখেছি মধুর হাসি॥

কী শোভা, কী ছায়া গো, কী স্নেহ, কী মায়া গো—
কী আঁচল বিছায়েছ বটের মূলে, নদীর কূলে কূলে।
মা, তোর মুখের বাণী আমার কানে লাগে সুধার মতো,
মরি হায়, হায় রে—
মা, তোর বদনখানি মলিন হলে, ও মা, আমি নয়নজলে ভাসি॥`
  },
  {
    title: 'পুরানো সেই দিনের কথা',
    artist: 'রবীন্দ্রনাথ ঠাকুর',
    album: 'গীতবিতান',
    genre: 'স্মৃতি',
    releaseYear: 1885,
    lyrics: `পুরানো সেই দিনের কথা ভুলবি কি রে হায়।
ও সেই চোখের দেখা, প্রাণের কথা, সে কি ভোলা যায়।
আয় আর-একটিবার আয় রে সখা, প্রাণের মাঝে আয়।
মোরা সুখের দুখের কথা কব, প্রাণ জুড়াবে তায়।

মোরা ভোরের বেলা ফুল তুলেছি, দুলেছি দোলায়—
বাজিয়ে বাঁশি গান গেয়েছি বকুলের তলায়।
হায় মাঝে হল ছাড়াছাড়ি, গেলেম কে কোথায়—
আবার দেখা যদি হল, সখা, প্রাণের মাঝে আয়॥`
  },
  {
    title: 'একতারা তুই দেশের কথা',
    artist: 'শাহ আব্দুল করিম',
    album: 'কালনীর ঢেউ',
    genre: 'লোকগীতি',
    releaseYear: 2000, // Approximate release year of album/common recording
    lyrics: `একতারা তুই দেশের কথা বল রে এবার বল
আমাকে তুই বাউল করে সঙ্গে নিয়ে চল।
জীবন মরন মাঝে তোর সুর যেন জীবন ভরে তোলে।
তোর সুর যেন ভোরের পাখি জাগিয়ে দিয়ে বলে ।।

কৃষক মজুর সবার কথা বল রে এবার বল
আমাকে তুই বাউল করে সঙ্গে নিয়ে চল ।।

মনের কথা গানের সুরে বলে যা তুই মোরে
এই মাটির পরশ দিয়ে দে রে আমার প্রানটা ভরে।
আমার একতারা তুই দেশের কথা বল রে এবার বল
আমাকে তুই বাউল করে সঙ্গে নিয়ে চল ।।`
  },
   {
    title: 'আমি বাংলায় গান গাই',
    artist: 'প্রতুল মুখোপাধ্যায়',
    album: 'পাথরের ফসল',
    genre: 'জীবনমুখী',
    releaseYear: 1994, // Approximate year
    lyrics: `আমি বাংলায় গান গাই, আমি বাংলার গান গাই
আমি আমার আমিকে চিরদিন এই বাংলায় খুঁজে পাই।
আমি বাংলায় দেখি স্বপ্ন, আমি বাংলায় বাঁধি সুর
আমি এই বাংলার মায়াভরা পথে হেঁটেছি এতটা দূর।

বাংলা আমার জীবনানন্দ বাংলা প্রাণের সুখ
আমি একবার দেখি, বারবার দেখি, দেখি বাংলার মুখ।

আমি বাংলায় কথা কই, আমি বাংলার কথা কই
আমি বাংলায় ভাসি, বাংলায় হাসি, বাংলায় জেগে রই।
আমি বাংলায় মাতি উল্লাসে, করি বাংলায় চিত্কার
বাংলা আমার দৃপ্ত স্লোগান ক্ষিপ্ত তীর ধনুক।`
  },
   {
    title: 'কফি হাউসের সেই আড্ডাটা',
    artist: 'মান্না দে',
    album: 'বিভিন্ন শিল্পী', // Often part of compilations
    genre: 'আধুনিক বাংলা গান',
    releaseYear: 1971, // Original release year
    lyrics: `কফি হাউসের সেই আড্ডাটা আজ আর নেই
আজ আর নেই।
কোথায় হারিয়ে গেল সোনালী বিকেলগুলো সেই
আজ আর নেই।

নিখিলেশ প্যারিসে, মইদুল ঢাকাতে
নেই তারা আজ কোন খবরে।
গ্র্যান্ডের গিটারিস্ট গোয়ানিস ডিসুজা
ঘুমিয়ে আছে যে আজ কবরে।
কাকে যেন ভালবেসে আঘাত পেয়ে যে শেষে
পাগলা গারদে আছে রমা রায়।
অমলটা ধুঁকছে দূর ক্যানসারে
জীবন করেনি তাকে ক্ষমা হায়।`
  },
  {
    title: 'নতুন গান উদাহরণ', // More descriptive placeholder title
    artist: 'নতুন শিল্পী উদাহরণ', // More descriptive placeholder artist
    album: 'অজানা অ্যালবাম',
    genre: 'পরীক্ষামূলক',
    releaseYear: 2024,
    lyrics: `নতুন দিনের নতুন গান,
উড়ছে পাখি গাইছে তান।
সূর্য মামা দিল উঁকি,
মনটা আমার খুশিতে ঝুঁকি।

সবুজ ঘাসে শিশির কণা,
ফুলে ফুলে মৌমাছি রণা।
নদীর জলে ঢেউয়ের খেলা,
কাটছে বেশ আনন্দ বেলা।`
  },
  {
      title: 'মেঘের কোলে রোদ হেসেছে',
      artist: 'রবীন্দ্রনাথ ঠাকুর', // Often attributed or set to music based on his poem
      album: 'শিশু ভোলানাথ', // Poem source
      genre: 'শিশুতোষ',
      releaseYear: 1922, // Poem publication year
      lyrics: `মেঘের কোলে রোদ হেসেছে, বাদল গেছে টুটি।
আজ আমাদের ছুটি ও ভাই, আজ আমাদের ছুটি।
কি করি আজ ভেবে না পাই, পথ হারিয়ে কোন বনে যাই,
কোন মাঠে যে ছুটে বেড়াই সকল ছেলে জুটি।

আয়রে মেঘ আয়রে মেঘ, টাপুর টুপুর সাঁজরে মেঘ,
বৃষ্টি ঝরে পড়ছে রিমঝিম করে গাছের পাতা নড়ছে।
হাওয়ায় দোলে ফুলের বন, নাচছে কেমন দেখ না মন,
আয়রে মেঘ আয়রে মেঘ, আয়রে আমার বুকে।`
  }
];

/**
 * Asynchronously retrieves song information based on a search query.
 * Simulates an API call with a delay.
 * Basic search matching title or artist.
 *
 * @param query The search query.
 * @returns A promise that resolves to an array of Song objects.
 */
export async function searchSongs(query: string): Promise<Song[]> {
  console.log(`Searching for: "${query}"`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  if (!query) {
    return [];
  }

  const lowerCaseQuery = query.toLowerCase();
  // Basic search: check if title or artist (in lowercase) includes the query
  // This might need refinement for Bengali script matching if simple includes isn't sufficient.
  // Consider using Intl.Collator for more robust language-sensitive searching if needed.
  const results = mockSongs.filter(song =>
    song.title.toLowerCase().includes(lowerCaseQuery) ||
    song.artist.toLowerCase().includes(lowerCaseQuery)
  );
  console.log(`Found ${results.length} results for "${query}"`);
  return results;
}

/**
 * Asynchronously retrieves a list of popular songs.
 * Simulates an API call. Returns a fixed subset for demo.
 *
 * @returns A promise that resolves to an array of Song objects.
 */
export async function getPopularSongs(): Promise<Song[]> {
  console.log("Fetching popular songs...");
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  // Return first 4 songs as "popular" for demo
  return mockSongs.slice(0, 4);
}

/**
 * Asynchronously retrieves a list of newly added songs.
 * Simulates an API call. Returns a different fixed subset for demo.
 *
 * @returns A promise that resolves to an array of Song objects.
 */
export async function getNewSongs(): Promise<Song[]> {
   console.log("Fetching new songs...");
   // Simulate network delay
   await new Promise(resolve => setTimeout(resolve, 250));
   // Return next songs as "new" for demo
   return mockSongs.slice(4, mockSongs.length);
}