'use server';

import { createSlug, toBengaliNumerals, cleanLyricsForDisplay, cleanDisplayString, cleanString } from '@/lib/utils';
import type { Song as SongInterface } from '@/types/song';

// Add id and slug to the Song interface for clarity
export interface Song extends SongInterface {
  id: string; // Make id mandatory for internal consistency
  slug: string; // Make slug mandatory
  keywords?: string[];
  matchCount?: number;
}

// Base mock data without pre-computed id/slug/keywords
// Reduced to a small subset to avoid build issues
const mockSongsData: Omit<Song, 'id' | 'slug' | 'keywords' | 'matchCount' | 'createdAt' >[] = [
  // Rabindranath Tagore Songs (Small Sample)
  {
    title: 'আমার সোনার বাংলা',
    artist: 'বিভিন্ন শিল্পী',
    lyricist: 'রবীন্দ্রনাথ ঠাকুর',
    genre: 'দেশাত্মবোধক',
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
    artist: 'বিভিন্ন শিল্পী',
    lyricist: 'রবীন্দ্রনাথ ঠাকুর',
    genre: 'স্মৃতি',
    releaseYear: 1885,
    lyrics: `পুরানো সেই দিনের কথা ভুলবি কি রে হায়।
ও সেই চোখের দেখা, প্রাণের কথা, সে কি ভোলা যায়।
আয় আর একটিবার আয় রে সখা, প্রাণের মাঝে আয়।
মোরা সুখের দুখের কথা কব, প্রাণ জুড়াবে তায়।`
  },
  {
    title: 'যদি তোর ডাক শুনে কেউ না আসে',
    artist: 'বিভিন্ন শিল্পী',
    lyricist: 'রবীন্দ্রনাথ ঠাকুর',
    genre: 'দেশাত্মবোধক',
    releaseYear: 1905,
    lyrics: `যদি তোর ডাক শুনে কেউ না আসে তবে একলা চলো রে।
একলা চলো, একলা চলো, একলা চলো, একলা চলো রে॥`
  },
  // Kazi Nazrul Islam songs (Small Sample)
  {
    title: 'কারার ঐ লৌহকপাট',
    artist: 'কাজী নজরুল ইসলাম',
    lyricist: 'কাজী নজরুল ইসলাম',
    genre: 'বিপ্লবী',
    releaseYear: 1922,
    lyrics: `কারার ঐ লৌহকপাট,
ভেঙে ফেল্‌ কর্‌ রে লোপাট,
রক্ত জমাট শিকল পূজার পাষাণ বেদী!
ওরে ও তরুণ ঈশান!
বাজা তোর প্রলয় বিষাণ!
ধ্বংস নিশান উড়ুক প্রাচীর প্রাচীর ভেদি॥`
  },
  {
    title: 'চল্‌ চল্‌ চল্‌',
    artist: 'কাজী নজরুল ইসলাম',
    lyricist: 'কাজী নজরুল ইসলাম',
    genre: 'মার্চ সঙ্গীত',
    releaseYear: 1929,
    lyrics: `চল্‌ চল্‌ চল্‌!
ঊর্ধ্ব গগনে বাজে মাদল
নিম্নে উতলা ধরণি তল,
অরুণ প্রাতের তরুণ দল
চল্‌ রে চল্‌ রে চল্‌
চল্‌ চল্‌ চল্‌॥`
  },
  // Other Artists' Songs (Small Sample)
  {
    title: 'একতারা তুই দেশের কথা',
    artist: 'শাহনাজ রহমতউল্লাহ',
    lyricist: 'গাজী মাজহারুল আনোয়ার',
    genre: 'দেশাত্মবোধক',
    releaseYear: 1970,
    lyrics: `একতারা তুই দেশের কথা
বলরে এবার বল।
আমাকে তুই বাউল করে
সঙ্গে নিয়ে চল।
জীবন মরন মাঝে
তোর সুর যেন বাজে।

একটি গানই আমি শুধু
গেয়ে যেতে চাই।
বাংলা আমার আমি যে তার
আর তো চাওয়া নাই রে…
আর তো চাওয়া নাই।
প্রানের প্রিয় তুমি
মোর সাধের জন্মভূমি।

একটি কথায় শুধু আমি
বলে যেতে চাই।
বাংলায় আমার সুখে দুঃখে
হয় যেন গো ঠাই রে
হয় যেন গো ঠাই।
তোমায় বরন করে
যেন যেতে পারি মরে।`
  },
  {
    title: 'আমি বাংলায় গান গাই',
    artist: 'প্রতুল মুখোপাধ্যায়',
    lyricist: 'প্রতুল মুখোপাধ্যায়',
    genre: 'জীবনমুখী',
    releaseYear: 1994,
    lyrics: `আমি বাংলায় গান গাই, আমি বাংলার গান গাই
আমি আমার আমিকে চিরদিন এই বাংলায় খুঁজে পাই।`
  },
  {
    title: 'কফি হাউসের সেই আড্ডাটা',
    artist: 'মান্না দে',
    lyricist: 'গৌরীপ্রসন্ন মজুমদার',
    genre: 'আধুনিক বাংলা গান',
    releaseYear: 1971,
    lyrics: `কফি হাউসের সেই আড্ডাটা আজ আর নেই
আজ আর নেই।
কোথায় হারিয়ে গেল সোনালী বিকেলগুলো সেই
আজ আর নেই।`
  },
  {
    title: 'মানুষ মানুষের জন্যে',
    artist: 'ভূপেন হাজারিকা',
    lyricist: 'ভূপেন হাজারিকা',
    genre: 'জীবনমুখী',
    releaseYear: 1970,
    lyrics: `মানুষ মানুষের জন্যে, জীবন জীবনের জন্যে,
একটু সহানুভূতি কি মানুষ পেতে পারে না, ও বন্ধু।`
  },
  {
    title: 'আমাকে আমার মতো থাকতে দাও',
    artist: 'অনুপম রায়',
    lyricist: 'অনুপম রায়',
    genre: 'আধুনিক',
    releaseYear: 2010,
    lyrics: `আমাকে আমার মতো থাকতে দাও
আমি নিজেকে নিজের মতো গুছিয়ে নিয়েছি।`
  },
  {
    title: 'নীলাঞ্জনা ১',
    artist: 'নচিকেতা চক্রবর্তী',
    lyricist: 'নচিকেতা চক্রবর্তী',
    genre: 'জীবনমুখী',
    releaseYear: 1993,
    lyrics: 'নীলাঞ্জনা ১',
  },
  {
    title: 'খাঁচার ভিতর অচিন পাখি',
    artist: 'বিভিন্ন বাউল',
    lyricist: 'লালন ফকির',
    genre: 'বাউল',
    releaseYear: 1850,
    lyrics: 'খাঁচার ভিতর অচিন পাখি কেমনে আসে যায়।',
  },
   // মাহমুদুজ্জামান বাবু Songs
  { title: 'রিয় মৃত্তিকা', artist: 'মাহমুদুজ্জামান বাবু', lyricist: 'মাহমুদুজ্জামান বাবু', genre: 'আধুনিক', releaseYear: 2005, lyrics: 'রিয় মৃত্তিকা' },
  { title: 'গঙ্গার জলে', artist: 'মাহমুদুজ্জামান বাবু', lyricist: 'মাহমুদুজ্জামান বাবু', genre: 'আধুনিক', releaseYear: 2008, lyrics: 'গঙ্গার জলে গঙ্গাজল থাকে না, মানুষের মনে কি মানুষ থাকে? প্রেম তো আগুনে পোড়ে না, পানি তো মেঘেতে ওড়ে না, কেন এ জীবন ভরে এত ফাঁকি?' },
  { title: 'আমার পরাণ যাহা চায়', artist: 'মাহমুদুজ্জামান বাবু', lyricist: 'রবীন্দ্রনাথ ঠাকুর', genre: 'রবীন্দ্রসঙ্গীত', releaseYear: 2010, lyrics: 'আমার পরাণ যাহা চায়, তুমি তাই, তুমি তাই গো। তোমা ছাড়া আর এ জগতে মোর কেহ নাই, কিছু নাই গো।' },
  { title: 'ভোর হয়নি', artist: 'মাহমুদুজ্জামান বাবু', lyricist: 'মাহমুদুজ্জামান বাবু', genre: 'আধুনিক', releaseYear: 2019, lyrics: 'ভোর হয়নি, আজ হলো না, কাল হবে কিনা তা জানা নেই' },
  { title: 'রাজা যায়', artist: 'মাহমুদুজ্জামান বাবু', lyricist: 'মাহমুদুজ্জামান বাবু', genre: 'আধুনিক', releaseYear: 2019, lyrics: 'রাজা যায় রাজা আসে'},
  { title: 'আস্থা হারোনোর দিন', artist: 'মাহমুদুজ্জামান বাবু', lyricist: 'মাহমুদুজ্জামান বাবু', genre: 'আধুনিক', releaseYear: 2019, lyrics: 'আস্থা হারোনোর দিন' },
  { title: 'রাত্রি', artist: 'মাহমুদুজ্জামান বাবু', lyricist: 'মাহমুদুজ্জামান বাবু', genre: 'আধুনিক', releaseYear: 2017, lyrics: 'রাত্রি ঘনঘোর, জানি বহুদূর প্রিয় সেই ভোর' },
  { title: 'নাচতে নেমে', artist: 'মাহমুদুজ্জামান বাবু', lyricist: 'মাহমুদুজ্জামান বাবু', genre: 'আধুনিক', releaseYear: 2011, lyrics: 'নাচতে নেমে ঘোমটা দেওয়া উচিত কাজ সে কখনও নয়' },
  { title: 'স্বপ্ন দেখার চোখ', artist: 'মাহমুদুজ্জামান বাবু', lyricist: 'মাহমুদুজ্জামান বাবু', genre: 'আধুনিক', releaseYear: 2017, lyrics: 'স্বপ্ন দেখার দিন' },
  { title: 'ঋণখেলাপি', artist: 'মাহমুদুজ্জামান বাবু', lyricist: 'মাহমুদুজ্জামান বাবু', genre: 'আধুনিক', releaseYear: 2012, lyrics: 'ঋণখেলাপি ধমক দিলেন' },
];

// Generate slugs and IDs for all songs
const mockSongs: Song[] = mockSongsData.map((song, index) => {
    const id = (index + 1).toString(); // Use index+1 as string for ID (1-based)
    const cleanedArtistString = cleanDisplayString(song.artist) || 'বিভিন্ন শিল্পী';
    const artistParts = cleanedArtistString.split(/[,;ওএবং&]+|\s+(?:ও|এবং)\s+/).map(part => cleanString(part.trim()) || '').filter(Boolean);
    const artistKeyForSlug = artistParts.join('-') || 'অজানা-শিল্পী';
    const lyricistKeyForSlug = cleanString(song.lyricist);
    const slug = createSlug(song.title, artistKeyForSlug, lyricistKeyForSlug, id);

    return {
        ...song,
        id: id,
        slug: slug,
        lyrics: cleanLyricsForDisplay(song.lyrics),
        genre: cleanDisplayString(song.genre),
    };
});


// Helper function to ensure every listed lyricist has at least one song entry
function addPlaceholderSongsForMissingLyricists() {
    const allKnownLyricists = [
        'রবীন্দ্রনাথ ঠাকুর', 'কাজী নজরুল ইসলাম', 'দ্বিজেন্দ্রলাল রায়', 'রজনীকান্ত সেন', 'অতুলপ্রসাদ সেন',
        'হিমাংশu দত্ত', 'মুকুন্দ দাস', 'গগন হরকরা', 'কমলাকান্ত ভট্টাচার্য', 'নিধুবাবু (রামনিধি গুপ্ত)',
        'কালী মির্জা (কাজী জলিল)', 'রাধারমণ দত্ত', 'দাশরথি রায়', 'ভোলা ময়রা', 'অ্যান্থনি ফিরিঙ্গি',
        'কবি ভোলানাথ', 'কবি নীলকণ্ঠ', 'কবি ভবানীচরণ', 'কবি হরু ঠাকুর', 'কবি যতীন্দ্রমোহন বাগচী',
        'গৌরীপ্রসন্ন মজুমদার', 'শ্যামল গুপ্ত', 'প্রণব রায়', 'সুধীন দাশগুপ্ত', 'পুলক বন্দ্যোপাধ্যায়',
        'শৈলেন রায়', 'সলিল চৌধুরী', 'প্রেমেন্দ্র মিত্র', 'সুকুমার রায়', 'কাজী মোতাহার হোসেন',
        'শিবদাস বন্দ্যোপাধ্যায়', 'মুকুল দত্ত', 'অমিতাভ ভট্টাচার্য', 'অঞ্জন চৌধুরী', 'অনুপম দত্ত',
        'আসাদুজ্জামান নূর', 'ভূপেন হাজারিকা', 'চন্দন ঘাটক', 'চিত্তরঞ্জন দাস', 'গৌতম সুস্মিত',
        'গিরিশচন্দ্র ঘোষ', 'হেমাঙ্গ বিশ্বাস', 'ইন্দ্রনাথ সেন', 'জয় গোস্বামী', 'কবীর সুমন',
        'কুমার জ্ঞানেন্দ্র', 'লালন ফকির', 'মনোজ মুর্শিদ', 'মাইকেল মধুসূদন দত্ত', 'গৌতম চট্টোপাধ্যায়',
        'নচিকেতা চক্রবর্তী', 'নিরেন্দ্রনাথ চক্রবর্তী', 'নির্মলেন্দু গুণ', 'পবিত্র সরকার', 'প্রীতিভূষণ ভট্টাচার্য',
        'প্রবীর মজুমদার', 'প্রিয় চট্টোপাধ্যায়', 'ফকির আলমগীর', 'বুদ্ধদেব দাশগুপ্ত', 'বেলাল চৌধুরী',
        'মণীন্দ্র গুপ্ত', 'মন্টু মুখোপাধ্যায়', 'মলয় গাঙ্গুলি', 'রবি চট্টোপাধ্যায়', 'ঋতুপর্ণ ঘোষ',
        'শিবরাম চক্রবর্তী', 'শ্যামল মিত্র', 'শ্রীজাত', 'সুদীপ্ত মুখোপাধ্যায়', 'সুধীরলাল চক্রবর্তী',
        'সুনীল গঙ্গোপাধ্যায়', 'স্বপন চক্রবর্তী', 'তারাপদ রায়', 'তৃপ্তি মিত্র', 'তীর্থঙ্কর দাস',
        'উত্তম কুমার', 'উজ্জ্বল মুখোপাধ্যায়', 'ঊষা গাঙ্গুলি', 'বাঈজী প্রীতিলতা', 'বিশ্বজিৎ চট্টোপাধ্যায়',
        'বিভাস চক্রবর্তী', 'বিপ্লব চৌধুরী', 'মৌসুমী ভৌমিক', 'যশ চোপড়া', 'রূপম ইসলাম',
        'অনুপম রায়', 'অনিন্দ্য চট্টোপাধ্যায়', 'উপল সেনগুপ্ত', 'প্রসেনজিৎ মুখোপাধ্যায়', 'ঋদ্ধি বন্দ্যোপাধ্যায়',
        'আনন্দ গুপ্ত', 'অরিন্দম চট্টোপাধ্যায়', 'সপ্তর্ষি মুখোপাধ্যায়', 'শান্তনু মৈত্র', 'সৌম্য চট্টোপাধ্যায়',
        'শান্তা দেবী', 'সৌরভ চৌধুরী', 'তানভীর ফয়সাল', 'জাহিদ আকবর', 'শাহাবুদ্দিন নাগরী',
        'গাজী মাজহারুল আনোয়ার', 'কবির বকুল', 'মোহাম্মদ রফিকুজ্জামান', 'মাসুদ করিম', 'মনিরুজ্জামান মনির',
        'সৈয়দ শামসুল হক', 'আহমেদ ইমতিয়াজ বুলবুল', 'খন্দকার নুরুল আলম', 'আপেল মাহমুদ', 'খন্দকার ফারুক আহমেদ',
        'নাসির আহমেদ নাসির', 'মাকসুদুল হক', 'ইমন সাহা', 'সাইদুস সালেহীন (সাজু)', 'ফুয়াদ নাসের বাবু',
        'বারী সিদ্দিকী', 'রথীন্দ্রনাথ রায়', 'শফিক তুহিন', 'রবিউল ইসলাম জিবন', 'শিবলী মোহাম্মদ',
        'শহরাব হোসেন', 'মিল্টন খন্দকার', 'তারিকুল ইসলাম', 'শুজিত রায়', 'পার্থ বড়ুয়া',
        'আনিসুল ইসলাম', 'শফিকুল খালেক', 'শফিকুল আলম', 'রানা', 'শুভ',
        'প্রীতম হাসান', 'নওশাদ আলী', 'তপন চৌধুরী', 'ফিরোজ শাই', 'রাশেদুল হাসান',
        'শুমন সুধর', 'তৌফিক ই ইলাহী চৌধুরী', 'ইমতিয়াজ আহমেদ', 'নোলক বাবু', 'ইমন চৌধুরী',
        'জাহিদ নিপু', 'মিলন মাহমুদ', 'শাহেদ সরওয়ার', 'মাহমুদুল হাসান', 'রবিউল আলম',
        'শাহীন আলম', 'তানজিদ নূর', 'মাহবুবুল হক', 'রিয়াজ উদ্দিন আহমেদ', 'আবুল হায়াত',
        'সমরেশ মজুমদার', 'শক্তি চট্টোপাধ্যায়', 'প্রদীপ ঘোষ', 'বিনয় মজুমদার', 'সুবোধ সরকার',
        'শঙ্খ ঘোষ', 'নবারুন ভট্টাচার্য্য', 'উৎপল কুমার বসু', 'অরিজিৎ দাস', 'সন্দীপ চট্টোপাধ্যায়',
        'কৃষ্ণেন্দু মুখোপাধ্যায়', 'অভিজিৎ বসু', 'শাহীন সামাদ', 'ইমরান মাহমুদউল্লাহ', 'তানজিদ তুহিন',
        'নাজমুল হাসান', 'ফাহিম হোসেন চৌধুরী', 'রবিন চন্দ', 'নাসিম আলী খান', 'রাজিব আহমেদ',
        'ফারহানা মিথিলা', 'হেমন্ত কুমার ত্রিপুরা', 'অর্পিতা দাস', 'বিকাশ রায়',
        'হরিচরণ আচার্য্য', 'রামপ্রসাদ সেন', 'দীনেন্দ্রকৃষ্ণ রায়', 'ঋত্বিজ মল্লিক', 'অর্ণব আদিত্য', 'তানিশা মুখার্জী',
        'ঐশানী সাহা', 'রুদ্র ঘোষ', 'সংগৃহীত', 'আব্দুল গাফফার চৌধুরী', 'মাহমুদুজ্জামান বাবু', 'প্রতুল মুখোপাধ্যায়',
    ];


    const existingLyricistSlugs = new Set(mockSongs.map(song => cleanString(song.lyricist)).filter(Boolean));
    let placeholderIndex = mockSongs.length + 1;

    allKnownLyricists.forEach(lyricist => {
        const cleanedKnownLyricistSlug = cleanString(lyricist);
        const displayLyricist = cleanDisplayString(lyricist) || 'Unknown';

        if (!cleanedKnownLyricistSlug) return;

        const individualNames = cleanedKnownLyricistSlug.split(/[,;-ও-]/).map(s => s.trim()).filter(Boolean);
        if (individualNames.length > 1) {
             if (individualNames.every(name => existingLyricistSlugs.has(name))) {
                 return;
             }
        }

        if (!existingLyricistSlugs.has(cleanedKnownLyricistSlug)) {
            const placeholderId = `placeholder-${placeholderIndex++}`;
            const placeholderTitle = `${displayLyricist} এর গান (স্থানধারক)`;
            const placeholderArtist = 'বিভিন্ন শিল্পী';
            const lyricistKeyForPlaceholderSlug = cleanedKnownLyricistSlug;
            const placeholderSlug = createSlug(placeholderTitle, placeholderArtist, lyricistKeyForPlaceholderSlug, placeholderId) || `${lyricistKeyForPlaceholderSlug}-placeholder-${placeholderId}`;

            const placeholderSong: Song = {
                id: placeholderId,
                title: placeholderTitle,
                artist: placeholderArtist,
                lyricist: lyricist,
                genre: 'Placeholder',
                lyrics: `এই গানটি গীতিকার ${displayLyricist} এর জন্য একটি স্থানধারক।`,
                slug: placeholderSlug,
            };
            mockSongs.push(placeholderSong);
            existingLyricistSlugs.add(cleanedKnownLyricistSlug);
            individualNames.forEach(name => existingLyricistSlugs.add(name));
        }
    });
}

addPlaceholderSongsForMissingLyricists();

export async function getAllSongs(): Promise<Song[]> {
  try {
    return mockSongs.filter(song => song.genre !== 'Placeholder');
  } catch (error: any) {
    console.error("Mock: Error fetching all songs:", error);
    return [];
  }
}


export async function getSongBySlug(slug: string): Promise<Song | undefined> {
  if (!slug || typeof slug !== 'string' || slug.trim() === '') {
    console.warn('Mock: getSongBySlug called with invalid slug.');
    return undefined;
  }

  let decodedSlug: string;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch (e) {
    console.warn(`Mock: Error decoding slug "${slug}", using as is. Error:`, e);
    decodedSlug = slug;
  }

  try {
    const song = mockSongs.find(s => s.slug === decodedSlug);

    if (song) {
      return song;
    } else {
       const parts = decodedSlug.split('-by-');
       if (parts.length >= 2) {
           const titlePart = parts[0];
           const rest = parts[1];
           const artistAndLyricistParts = rest.split('-lyricist-');
           const artistPart = artistAndLyricistParts[0];
           const idPartOrLyricistIdPart = artistAndLyricistParts[1] || rest; // If no -lyricist-, then rest is artist-id

           let idPart: string | undefined;
           if (artistAndLyricistParts[1]) { // If -lyricist- exists
                const lyricistAndId = artistAndLyricistParts[1].split('-');
                idPart = lyricistAndId.pop(); // Last part is ID
           } else { // If no -lyricist-, then ID is the last part of artist-id
                const artistIdParts = rest.split('-');
                idPart = artistIdParts.pop();
           }


           const potentialMatch = mockSongs.find(s => {
                const songTitleSlug = cleanString(s.title)?.toLowerCase() || 'শিরোনামহীন';
                const cleanedArtistString = cleanDisplayString(s.artist) || 'বিভিন্ন শিল্পী';
                const songArtistParts = cleanedArtistString.split(/[,;ওএবং&]+|\s+(?:ও|এবং)\s+/).map(part => cleanString(part.trim())?.toLowerCase() || '').filter(Boolean);
                const songArtistKey = songArtistParts.join('-') || 'অজানা-শিল্পী';

                const searchArtistKey = cleanString(artistPart)?.toLowerCase() || 'অজানা-শিল্পী';

                return songTitleSlug === titlePart && songArtistKey === searchArtistKey && s.id === idPart;
           });

           if (potentialMatch) {
               console.warn(`Mock: Found song by enhanced fallback matching for slug: "${decodedSlug}". Returning song: ${potentialMatch.title}`);
               return potentialMatch;
           }
       }

      console.error(`Mock: Song not found for decoded slug "${decodedSlug}" (raw: ${slug}) by direct match or enhanced fallback.`);
      return undefined;
    }
  } catch (error: any) {
     console.error(`Mock: Error fetching song by slug "${decodedSlug}" (raw: ${slug}):`, error);
     return undefined;
  }
}

export async function searchSongs(searchQuery: string): Promise<Song[]> {
  if (!searchQuery || searchQuery.trim() === '') {
    return [];
  }
  const displayCleanedQuery = cleanDisplayString(searchQuery)?.toLowerCase() || "";
  const queryTokens = displayCleanedQuery.split(/\s+/).filter(token => token.length > 0);
  const slugCleanedQuery = cleanString(searchQuery)?.toLowerCase() || "";

  if (queryTokens.length === 0 && slugCleanedQuery.length === 0) return [];

  const filteredSongs = mockSongs.filter(song => {
    if (song.genre === 'Placeholder') return false;

    const songTitleMatch = cleanDisplayString(song.title)?.toLowerCase() || "";
    const songArtists = (cleanDisplayString(song.artist)?.toLowerCase() || "").split(/[,;ওএবং&]+|\s+(?:ও|এবং)\s+/).map(a => a.trim()).filter(Boolean);
    const songLyricistMatch = cleanDisplayString(song.lyricist)?.toLowerCase() || "";
    const songGenreMatch = cleanDisplayString(song.genre)?.toLowerCase() || "";
    const songLyricsMatch = cleanLyricsForDisplay(song.lyrics)?.toLowerCase() || "";

    const wordMatch = queryTokens.every(token => (
        songTitleMatch.includes(token) ||
        songArtists.some(artist => artist.includes(token)) ||
        songLyricistMatch.includes(token) ||
        songGenreMatch.includes(token) ||
        songLyricsMatch.includes(token)
    ));
    const slugMatch = song.slug.startsWith(slugCleanedQuery);
    return wordMatch || slugMatch;
  });

  const rankedSongs = filteredSongs.map(song => {
    let matchCount = 0;
    const songTitleMatch = cleanDisplayString(song.title)?.toLowerCase() || "";
    const songArtists = (cleanDisplayString(song.artist)?.toLowerCase() || "").split(/[,;ওএবং&]+|\s+(?:ও|এবং)\s+/).map(a => a.trim()).filter(Boolean);
    const songLyricistMatch = cleanDisplayString(song.lyricist)?.toLowerCase() || "";

    queryTokens.forEach(token => {
      if (songTitleMatch.includes(token)) matchCount += 3;
      if (songArtists.some(artist => artist.includes(token))) matchCount += 2;
      if (songLyricistMatch.includes(token)) matchCount += 1;
    });

    if (songTitleMatch.includes(displayCleanedQuery)) matchCount += 5;
    if (songArtists.some(artist => artist.includes(displayCleanedQuery))) matchCount += 4;
    if (songLyricistMatch.includes(displayCleanedQuery)) matchCount += 3;
    if (song.slug.startsWith(slugCleanedQuery)) matchCount += 2;

    return { ...song, matchCount };
  }).sort((a, b) => b.matchCount - a.matchCount);

  return rankedSongs;
}


export async function getPopularSongs(): Promise<Song[]> {
   const popularSongDefinitions = [
        { title: 'আমার সোনার বাংলা', artist: 'বিভিন্ন শিল্পী', lyricist: 'রবীন্দ্রনাথ ঠাকুর' },
        { title: 'যদি তোর ডাক শুনে কেউ না আসে', artist: 'বিভিন্ন শিল্পী', lyricist: 'রবীন্দ্রনাথ ঠাকুর'},
        { title: 'একতারা তুই দেশের কথা', artist: 'শাহনাজ রহমতউল্লাহ', lyricist: 'গাজী মাজহারুল আনোয়ার' },
        { title: 'কফি হাউসের সেই আড্ডাটা', artist: 'মান্না দে', lyricist: 'গৌরীপ্রসন্ন মজুমদার' },
        { title: 'মানুষ মানুষের জন্যে', artist: 'ভূপেন হাজারিকা', lyricist: 'ভূপেন হাজারিকা' },
   ];

  let popular: Song[] = [];

  try {
    popular = popularSongDefinitions.map(def => {
        return mockSongs.find(s =>
            cleanDisplayString(s.title) === cleanDisplayString(def.title) &&
            (cleanDisplayString(s.artist)?.split(/[,;ওএবং&]+|\s+(?:ও|এবং)\s+/).map(a=>a.trim()).includes(cleanDisplayString(def.artist) || "") || cleanDisplayString(s.artist) === cleanDisplayString(def.artist)) &&
            cleanDisplayString(s.lyricist) === cleanDisplayString(def.lyricist) &&
            s.genre !== 'Placeholder'
        );
    }).filter((song): song is Song => song !== undefined);


    if (popular.length < popularSongDefinitions.length) {
        console.warn("Mock: Could not find all predefined popular songs. Filling with other songs.");
        const existingSlugs = new Set(popular.map(p => p.slug));
        const needed = popularSongDefinitions.length - popular.length;
        let addedCount = 0;

        const fallbackSongs = [...mockSongs]
          .filter(s => s.releaseYear && s.genre !== 'Placeholder' && s.slug && !existingSlugs.has(s.slug))
          .sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0));

        for (const song of fallbackSongs) {
            if (addedCount >= needed) break;
            popular.push(song);
            existingSlugs.add(song.slug);
            addedCount++;
        }
    }
  } catch (error:any) {
    console.error("Mock: Error fetching popular songs:", error);
    return [];
  }
  return popular.slice(0, 8);
}

export async function getNewSongs(): Promise<Song[]> {
    try {
      const sortedSongs = [...mockSongs]
        .filter(s => s.releaseYear && s.genre !== 'Placeholder')
        .sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0))
        .slice(0, 8);
      return sortedSongs;
    } catch (error: any) {
      console.error("Mock: Error fetching new songs:", error);
      return [];
    }
}


async function getUniqueFieldValues(
  fieldName: keyof Pick<Song, 'artist' | 'genre' | 'lyricist'>,
  cleanFunction: (str: string | undefined | null) => string | undefined = cleanDisplayString,
  splitCombined: boolean = false
): Promise<string[]> {
  try {
    const valuesSet = new Set<string>();
    mockSongs.forEach(song => {
      if (song.genre === 'Placeholder' && (fieldName === 'artist' || fieldName === 'genre' || fieldName === 'lyricist')) {
          return;
      }

      const rawValue = song[fieldName] as string | undefined;
      if (rawValue) {
        let valuesToAdd: string[] = [];
        if (splitCombined && fieldName === 'artist') {
          const cleanedValue = cleanDisplayString(rawValue);
          if(cleanedValue){
             valuesToAdd = cleanedValue.split(/[,;ওএবং&]+|\s+(?:ও|এবং)\s+/).map(namePart => namePart.trim()).filter(Boolean);
          }
        } else {
          const cleanedValue = cleanFunction(rawValue);
          if (cleanedValue) {
            valuesToAdd.push(cleanedValue);
          }
        }
         valuesToAdd.map(val => cleanDisplayString(val))
                   .filter((cleanedVal): cleanedVal is string => !!cleanedVal)
                   .forEach(finalVal => valuesSet.add(finalVal));
      }
    });
    const uniqueValues = Array.from(valuesSet);
    const filteredValues = uniqueValues.filter(val => val !== 'Placeholder' && val.toLowerCase() !== 'various artists' && val !== 'বিভিন্ন শিল্পী');

    if (uniqueValues.some(val => val.toLowerCase() === 'various artists' || val === 'বিভিন্ন শিল্পী') && !filteredValues.includes('বিভিন্ন শিল্পী')) {
        if (mockSongs.some(s => cleanDisplayString(s.artist) === 'বিভিন্ন শিল্পী')) {
            filteredValues.push('বিভিন্ন শিল্পী');
        }
    }

    return filteredValues.sort((a, b) => a.localeCompare(b, 'bn'));
  } catch (error: any) {
    console.error(`Mock: Error fetching unique field values for ${fieldName}:`, error);
    return [];
  }
}


export async function getAllArtists(): Promise<string[]> {
    const artists = await getUniqueFieldValues('artist', cleanDisplayString, true);
    const priorityOrder = ['রবীন্দ্রনাথ ঠাকুর', 'কাজী নজরুল ইসলাম', 'ভূপেন হাজারিকা', 'বিভিন্ন শিল্পী'];
    return artists.sort((a, b) => {
        const aCleaned = cleanDisplayString(a) || "";
        const bCleaned = cleanDisplayString(b) || "";
        const aPriority = priorityOrder.indexOf(aCleaned);
        const bPriority = priorityOrder.indexOf(bCleaned);

        if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
        if (aPriority !== -1) return -1;
        if (bPriority !== -1) return 1;
        return aCleaned.localeCompare(bCleaned, 'bn');
    });
}


export async function getAllGenres(): Promise<string[]> {
  return getUniqueFieldValues('genre', cleanDisplayString);
}

export async function getAllLyricists(): Promise<string[]> {
  const lyricists = await getUniqueFieldValues('lyricist', cleanDisplayString);
  const priorityOrder = ['রবীন্দ্রনাথ ঠাকুর', 'কাজী নজরুল ইসলাম', 'দ্বিজেন্দ্রলাল রায়', 'রজনীকান্ত সেন', 'অতুলপ্রসাদ সেন', 'সংগৃহীত'];
  return lyricists.sort((a, b) => {
    const aCleaned = cleanDisplayString(a) || "";
    const bCleaned = cleanDisplayString(b) || "";
    const aPriority = priorityOrder.indexOf(aCleaned);
    const bPriority = priorityOrder.indexOf(bCleaned);

    if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
    if (aPriority !== -1) return -1;
    if (bPriority !== -1) return 1;
    return aCleaned.localeCompare(bCleaned, 'bn');
  });
}


export async function getPaginatedSongs(page: number, limitPerPage: number): Promise<{songs: Song[], nextPageCursor: null }> {
    const start = (page - 1) * limitPerPage;
    const end = start + limitPerPage;
    const nonPlaceholderSongs = mockSongs.filter(song => song.genre !== 'Placeholder');
    if (start >= nonPlaceholderSongs.length) {
        return { songs: [], nextPageCursor: null };
    }
    const songs = nonPlaceholderSongs.slice(start, Math.min(end, nonPlaceholderSongs.length));
    return { songs, nextPageCursor: null };
}


export async function getTotalSongCount(): Promise<number> {
  return mockSongs.filter(song => song.genre !== 'Placeholder').length;
}


console.log("Using MOCK bangla-song-database.ts loaded.");
console.log(`Final mockSongs count after placeholder check: ${mockSongs.length}`);

export async function seedDatabase() {
  console.log("Mock database: seedDatabase called, but no action is taken.");
  return Promise.resolve();
}
