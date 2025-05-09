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
    releaseYear: 1850, // Approximate
    lyrics: 'খাঁচার ভিতর অচিন পাখি কেমনে আসে যায়।',
  },
  {
    title: 'প্রিয় মৃত্তিকা',
    artist: 'মাহমুদুজ্জামান বাবু',
    lyricist: 'মাহমুদুজ্জামান বাবু',
    genre: 'আধুনিক',
    releaseYear: 2005,
    lyrics: 'প্রিয় মৃত্তিকা'
  },
  {
    title: 'বাংলাদেশ',
    artist: 'মাহমুদুজ্জামান বাবু',
    lyricist: 'মাহমুদুজ্জামান বাবু',
    genre: 'আধুনিক',
    releaseYear: 2008,
    lyrics: 'বাংলাদেশ'
  },
  {
    title: 'ঘুম ঘুম রাত',
    artist: 'মাহমুদুজ্জামান বাবু',
    lyricist: 'মাহমুদুজ্জামান বাবু',
    genre: 'আধুনিক',
    releaseYear: 2010,
    lyrics: 'ঘুম ঘুম রাত যায় ঘুম ঘুম দিন'
  },
  {
    title: 'আমার নয়ন ভরা',
    artist: 'মাহমুদুজ্জামান বাবু',
    lyricist: 'মাহমুদুজ্জামান বাবু',
    genre: 'আধুনিক',
    releaseYear: 2012,
    lyrics: 'আমার নয়ন ভরা জল'
  },
  {
    title: 'দুই নয়নে',
    artist: 'মাহমুদুজ্জামান বাবু',
    lyricist: 'মাহমুদুজ্জামান বাবু',
    genre: 'আধুনিক',
    releaseYear: 2012,
    lyrics: 'দুই নয়নে দেখি যাহা'
  },
  {
    title: 'খুলে দে মা',
    artist: 'মাহমুদুজ্জামান বাবু',
    lyricist: 'মাহমুদুজ্জামান বাবু',
    genre: 'আধুনিক',
    releaseYear: 2012,
    lyrics: 'খুলে দে মা শিকলের বন্ধন'
  },
  {
    title: 'যাবে',
    artist: 'মাহমুদুজ্জামান বাবু',
    lyricist: 'মাহমুদুজ্জামান বাবু',
    genre: 'আধুনিক',
    releaseYear: 2012,
    lyrics: 'যাবে? যাও, যাত্রা শুভ হোক'
  },
  {
    title: 'সোনার অঙ্গ',
    artist: 'মাহমুদুজ্জামান বাবু',
    lyricist: 'মাহমুদুজ্জামান বাবু',
    genre: 'আধুনিক',
    releaseYear: 2017,
    lyrics: 'সোনার অঙ্গ'
  },
  {
    title: 'মেঘবালিকা',
    artist: 'মাহমুদুজ্জামান বাবু',
    lyricist: 'মাহমুদুজ্জামান বাবু',
    genre: 'আধুনিক',
    releaseYear: 2016,
    lyrics: 'মেঘবালিকা ও মেঘবালিকা, কত স্বপ্নকথা ছিল তোমার সাথে'
  },
  {
    title: 'ভোর হয়নি',
    artist: 'মাহমুদুজ্জামান বাবু',
    lyricist: 'মাহমুদুজ্জামান বাবু',
    genre: 'আধুনিক',
    releaseYear: 2019,
    lyrics: 'ভোর হয়নি, আজ হলো না, কাল হবে কিনা তা জানা নেই'
  },
  {
    title: 'রাজা যায়',
    artist: 'মাহমুদুজ্জামান বাবু',
    lyricist: 'মাহমুদুজ্জামান বাবু',
    genre: 'আধুনিক',
    releaseYear: 2019,
    lyrics: 'রাজা যায় রাজা আসে'
  },
  {
    title: 'আস্থা হারোনোর দিন',
    artist: 'মাহমুদুজ্জামান বাবু',
    lyricist: 'মাহমুদুজ্জামান বাবু',
    genre: 'আধুনিক',
    releaseYear: 2019,
    lyrics: 'আস্থা হারোনোর দিন'
  },
  {
    title: 'রাত্রি',
    artist: 'মাহমুদুজ্জামান বাবু',
    lyricist: 'মাহমুদুজ্জামান বাবু',
    genre: 'আধুনিক',
    releaseYear: 2017,
    lyrics: 'রাত্রি ঘনঘোর, জানি বহুদূর প্রিয় সেই ভোর'
  },
  {
    title: 'নাচতে নেমে',
    artist: 'মাহমুদুজ্জামান বাবু',
    lyricist: 'মাহমুদুজ্জামান বাবু',
    genre: 'আধুনিক',
    releaseYear: 2011,
    lyrics: 'নাচতে নেমে ঘোমটা দেওয়া উচিত কাজ সে কখনও নয়'
  },
  {
    title: 'স্বপ্ন দেখার চোখ',
    artist: 'মাহমুদুজ্জামান বাবু',
    lyricist: 'মাহমুদুজ্জামান বাবু',
    genre: 'আধুনিক',
    releaseYear: 2017,
    lyrics: 'স্বপ্ন দেখার দিন'
  },
  {
    title: 'ঋণখেলাপি',
    artist: 'মাহমুদুজ্জামান বাবু',
    lyricist: 'মাহমুদুজ্জামান বাবু',
    genre: 'আধুনিক',
    releaseYear: 2012,
    lyrics: 'ঋণখেলাপি ধমক দিলেন'
  },
  {
    title: 'মনের খবর',
    artist: 'মাহমুদুজ্জামান বাবু',
    lyricist: 'মাহমুদুজ্জামান বাবু',
    genre: 'আধুনিক',
    releaseYear: 2014,
    lyrics: 'মনের খবর রাখি না, মন লুকালো মনের ভিতর'
  },
  { title: 'এক জীবন', artist: 'মাহমুদুজ্জামান বাবু', lyricist: 'মাহমুদুজ্জামান বাবু', genre: 'আধুনিক', releaseYear: 2005, lyrics: 'এক জীবন হেঁটে গেছি, দু’জীবন বসে আছি, তিন জীবন ঘুমিয়ে রব কবরে বন্ধু। তুমি কি আমার হবে?' },
  { title: 'গঙ্গার জলে', artist: 'মাহমুদুজ্জামান বাবু', lyricist: 'মাহমুদুজ্জামান বাবু', genre: 'আধুনিক', releaseYear: 2008, lyrics: 'গঙ্গার জলে গঙ্গাজল থাকে না, মানুষের মনে কি মানুষ থাকে? প্রেম তো আগুনে পোড়ে না, পানি তো মেঘেতে ওড়ে না, কেন এ জীবন ভরে এত ফাঁকি?' },
  { title: 'আমার পরাণ যাহা চায়', artist: 'মাহমুদুজ্জামান বাবু', lyricist: 'রবীন্দ্রনাথ ঠাকুর', genre: 'রবীন্দ্রসঙ্গীত', releaseYear: 2010, lyrics: 'আমার পরাণ যাহা চায়, তুমি তাই, তুমি তাই গো। তোমা ছাড়া আর এ জগতে মোর কেহ নাই, কিছু নাই গো।' },

  // অনুপম রায়
  { title: 'আমি আজকাল ভালো আছি', artist: 'অনুপম রায়', lyricist: 'অনুপম রায়', genre: 'আধুনিক', releaseYear: 2010, lyrics: 'আমি আজকাল ভালো আছি, তোর খবর কি?'},
  { title: 'একবার বল', artist: 'অনুপম রায়', lyricist: 'অনুপম রায়', genre: 'আধুনিক', releaseYear: 2011, lyrics: 'একবার বল নেই তোর কেউ নেই, একবার বল আমি ছাড়া আর কেউ নেই'},
  { title: 'যখন পড়বে না মোর পায়ের চিহ্ন', artist: 'অনুপম রায়', lyricist: 'রবীন্দ্রনাথ ঠাকুর', genre: 'রবীন্দ্রসঙ্গীত', releaseYear: 2014, lyrics: 'যখন পড়বে না মোর পায়ের চিহ্ন এই বাটে'},
  { title: 'অটোগ্রাফ', artist: 'অনুপম রায়', lyricist: 'অনুপম রায়', genre: 'আধুনিক', releaseYear: 2010, lyrics: 'চল রাস্তায় সাজি ট্রাম লাইন, আর কবিতায় শুয়ে couplet'},
  { title: 'তুই যাকে চাস', artist: 'অনুপম রায়', lyricist: 'অনুপম রায়', genre: 'আধুনিক', releaseYear: 2015, lyrics: 'তুই যাকে চাস, সে তোকে চায় না'},
  { title: 'বসন্ত এসে গেছে', artist: 'অনুপম রায়', lyricist: 'অনুপম রায়', genre: 'আধুনিক', releaseYear: 2015, lyrics: 'বসন্ত এসে গেছে, árboles পাতা নেই, শুধু শুকনো ডালপালা'},
  { title: 'সোহাগ চাঁদ বদনি', artist: 'অনুপম রায়', lyricist: 'অনুপম রায়', genre: 'আধুনিক', releaseYear: 2017, lyrics: 'সোহাগ চাঁদ বদনি ধনি নাচতো দেখি'},
  { title: 'বেঁচে থাকার গান', artist: 'অনুপম রায়', lyricist: 'অনুপম রায়', genre: 'আধুনিক', releaseYear: 2013, lyrics: 'এই ভাবে বেঁচে থাকার মানে হয় না'},
  { title: 'কলকাতা', artist: 'অনুপম রায়', lyricist: 'অনুপম রায়', genre: 'আধুনিক', releaseYear: 2015, lyrics: 'কলকাতা, তুমিও হেঁটে দেখো কলকাতা'},
  { title: 'তুমি রবে নীরবে', artist: 'অনুপম রায়', lyricist: 'রবীন্দ্রনাথ ঠাকুর', genre: 'রবীন্দ্রসঙ্গীত', releaseYear: 2016, lyrics: 'তুমি রবে নীরবে হৃদয়ে মম'},
  { title: 'তুই কি আমার হবি রে', artist: 'অনুপম রায়', lyricist: 'অনুপম রায়', genre: 'আধুনিক', releaseYear: 2019, lyrics: 'তুই কি আমার হবি রে, ও পাগল মন'},
  { title: 'যেখানে শুরুর কথা', artist: 'অনুপম রায়', lyricist: 'অনুপম রায়', genre: 'আধুনিক', releaseYear: 2015, lyrics: 'যেখানে শুরুর কথা বলার আগেই শেষ'},
  {
    title: 'আহারে মন',
    artist: 'অনুপম রায়',
    lyricist: 'অনুপম রায়',
    genre: 'আধুনিক',
    releaseYear: 2015,
    lyrics: `আহারে মন, আহারে মন, কেন তুই কাঁদিস এমন
যা হবার তা হয়ে গেছে, মিছে কেন ভাবিস এখন।
এই তো জীবন, এই তো খেলা, হাসি কান্না সুখে দুখে ভরা
সবকিছু মেনে নিয়ে, চল এগিয়ে যাই মোরা।`
  },

  // নচিকেতা চক্রবর্তী - 50 songs
  { title: 'নীলাঞ্জনা ২', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1994, lyrics: 'নীলাঞ্জনা ২' },
  { title: 'অনির্বাণ', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1993, lyrics: 'অনির্বাণ' },
  { title: 'বৃদ্ধাশ্রম', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1995, lyrics: 'বৃদ্ধাশ্রম' },
  { title: 'এ মন ব্যাকুল যখন তখন', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1993, lyrics: 'এ মন ব্যাকুল যখন তখন' },
  { title: 'যখন সময় থমকে দাঁড়ায়', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1996, lyrics: 'যখন সময় থমকে দাঁড়ায়' },
  { title: 'ডাক্তার', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1994, lyrics: 'ডাক্তার' },
  { title: 'উল্টো রাজার দেশে', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1997, lyrics: 'উল্টো রাজার দেশে' },
  { title: 'একদিন ঝড় থেমে যাবে', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1995, lyrics: 'একদিন ঝড় থেমে যাবে' },
  { title: 'পাগলা জগাই', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1998, lyrics: 'পাগলা জগাই' },
  { title: 'সরকারি কর্মচারী', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1996, lyrics: 'সরকারি কর্মচারী' },
  { title: 'তুমি আসবে বলেই', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1994, lyrics: 'তুমি আসবে বলেই' },
  { title: 'ফেরিওয়ালা', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1993, lyrics: 'ফেরিওয়ালা' },
  { title: 'এই শহর', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1995, lyrics: 'এই শহর' },
  { title: 'অন্তবিহীন পথে', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1997, lyrics: 'অন্তবিহীন পথে' },
  { title: 'ইটস এ গেম', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1999, lyrics: 'ইটস এ গেম' },
  { title: 'রাজশ্রী', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1993, lyrics: 'রাজশ্রী' },
  { title: 'তুমি কি আমায় ভালোবাসো', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1996, lyrics: 'তুমি কি আমায় ভালোবাসো' },
  { title: 'কুয়াশা যখন', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1998, lyrics: 'কুয়াশা যখন' },
  { title: 'মন ভেসে যায়', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 2000, lyrics: 'মন ভেসে যায়' },
  { title: 'এই বেশ ভালো আছি', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1993, lyrics: 'এই বেশ ভালো আছি' },
  { title: 'ইনটেলেকচুয়াল', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1994, lyrics: 'ইনটেলেকচুয়াল' },
  { title: 'অ্যাম্বিশন', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1995, lyrics: 'অ্যাম্বিশন' },
  { title: 'ভয়', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1996, lyrics: 'ভয়' },
  { title: 'বাসবেই ভালো', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1997, lyrics: 'বাসবেই ভালো' },
  { title: 'এই পথ যদি না শেষ হয়', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'গৌরীপ্রসন্ন মজুমদার', genre: 'আধুনিক বাংলা গান', releaseYear: 1998, lyrics: 'এই পথ যদি না শেষ হয়' }, // Originally sung by Hemanta Mukherjee
  { title: 'সে প্রথম প্রেম আমার', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1993, lyrics: 'সে প্রথম প্রেম আমার' },
  { title: 'সারে জাঁহা সে আচ্ছা', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'আল্লামা ইকবাল', genre: 'দেশাত্মবোধক', releaseYear: 1999, lyrics: 'সারে জাঁহা সে আচ্ছা' },
  { title: 'কফি হাউস', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'গৌরীপ্রসন্ন মজুমদার', genre: 'আধুনিক বাংলা গান', releaseYear: 1993, lyrics: 'কফি হাউসের সেই আড্ডাটা আজ আর নেই' }, // Re-rendering of Manna Dey's classic
  { title: 'পুরানো দিনের গান', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 2001, lyrics: 'পুরানো দিনের গান' },
  { title: 'এত বিঘ্ন সয়ে', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1994, lyrics: 'এত বিঘ্ন সয়ে' },
  { title: 'চোর', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1995, lyrics: 'চোর' },
  { title: 'আমার এ ভালোবাসাটুকু', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1996, lyrics: 'আমার এ ভালোবাসাটুকু' },
  { title: 'শোনো পৃথিবী শোনো', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1997, lyrics: 'শোনো পৃথিবী শোনো' },
  { title: 'মন চায়', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1998, lyrics: 'মন চায়' },
  { title: 'নীল আকাশের নীচে', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'গৌরীপ্রসন্ন মজুমদার', genre: 'আধুনিক বাংলা গান', releaseYear: 1999, lyrics: 'নীল আকাশের নীচে এই পৃথিবী' }, // Originally by Hemanta Mukherjee
  { title: 'যদি কাগজে লেখো নাম', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'পুলক বন্দ্যোপাধ্যায়', genre: 'আধুনিক বাংলা গান', releaseYear: 2000, lyrics: 'যদি কাগজে লেখো নাম' }, // Originally by Manna Dey
  { title: 'ও নদীরে', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'গৌরীপ্রসন্ন মজুমদার', genre: 'আধুনিক বাংলা গান', releaseYear: 2002, lyrics: 'ও নদীরে, একটি কথা শুধাই শুধু তোমারে' }, // Originally by Hemanta Mukherjee
  { title: 'বৃষ্টি তোমাকে দিলাম', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'শ্রীজাত', genre: 'আধুনিক', releaseYear: 2004, lyrics: 'বৃষ্টি তোমাকে দিলাম' },
  { title: 'আমিই পারি', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1993, lyrics: 'আমিই পারি' },
  { title: 'পেশাদারী খুনী', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1994, lyrics: 'পেশাদারী খুনী' },
  { title: 'মন্ত্রী', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1995, lyrics: 'মন্ত্রী' },
  { title: 'সকাল থেকে রাত', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1996, lyrics: 'সকাল থেকে রাত' },
  { title: 'দেওয়াল লিখন', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1997, lyrics: 'দেওয়াল লিখন' },
  { title: 'তুই বলবি কি আর', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1998, lyrics: 'তুই বলবি কি আর' },
  { title: 'অন্য প্রেমের গান', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 1999, lyrics: 'অন্য প্রেমের গান' },
  { title: 'তুমি আসবে বলে আকাশ মেঘলা', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 2000, lyrics: 'তুমি আসবে বলে আকাশ মেঘলা' },
  { title: 'এ জীবন পুড়ে ছাই', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 2001, lyrics: 'এ জীবন পুড়ে ছাই' },
  { title: 'হঠাৎ বৃষ্টি', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 2002, lyrics: 'হঠাৎ বৃষ্টি' },
  { title: 'আমি যারে ভালোবাসি', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'নচিকেতা চক্রবর্তী', genre: 'জীবনমুখী', releaseYear: 2003, lyrics: 'আমি যারে ভালোবাসি' },
  { title: 'শ্রাবণ দিনে', artist: 'নচিকেতা চক্রবর্তী', lyricist: 'রবীন্দ্রনাথ ঠাকুর', genre: 'রবীন্দ্রসঙ্গীত', releaseYear: 2004, lyrics: 'শ্রাবণ দিনে যদি আসে রজনী' },

  // লালন ফকির - 20 songs
  { title: 'সব লোকে কয় লালন কি জাত সংসারে', artist: 'বিভিন্ন বাউল', lyricist: 'লালন ফকির', genre: 'বাউল', releaseYear: 1850, lyrics: 'সব লোকে কয় লালন কি জাত সংসারে' },
  { title: 'মিলন হবে কত দিনে', artist: 'বিভিন্ন বাউল', lyricist: 'লালন ফকির', genre: 'বাউল', releaseYear: 1850, lyrics: 'মিলন হবে কত দিনে' },
  { title: 'আমার ঘরের চাবি পরের হাতে', artist: 'বিভিন্ন বাউল', lyricist: 'লালন ফকির', genre: 'বাউল', releaseYear: 1850, lyrics: 'আমার ঘরের চাবি পরের হাতে' },
  { title: 'জাত গেল জাত গেল বলে', artist: 'বিভিন্ন বাউল', lyricist: 'লালন ফকির', genre: 'বাউল', releaseYear: 1850, lyrics: 'জাত গেল জাত গেল বলে' },
  { title: 'সময় গেলে সাধন হবে না', artist: 'বিভিন্ন বাউল', lyricist: 'লালন ফকির', genre: 'বাউল', releaseYear: 1850, lyrics: 'সময় গেলে সাধন হবে না' },
  { title: 'আমার আমি না থাকিলে', artist: 'বিভিন্ন বাউল', lyricist: 'লালন ফকির', genre: 'বাউল', releaseYear: 1850, lyrics: 'আমার আমি না থাকিলে' },
  { title: 'মানুষ ভজলে সোনার মানুষ হবি', artist: 'বিভিন্ন বাউল', lyricist: 'লালন ফকির', genre: 'বাউল', releaseYear: 1850, lyrics: 'মানুষ ভজলে সোনার মানুষ হবি' },
  { title: 'আমার বাড়ীর কাছে আরশিনগর', artist: 'বিভিন্ন বাউল', lyricist: 'লালন ফকির', genre: 'বাউল', releaseYear: 1850, lyrics: 'আমার বাড়ীর কাছে আরশিনগর' },
  { title: 'এমন মানব জনম আর কি হবে', artist: 'বিভিন্ন বাউল', lyricist: 'লালন ফকির', genre: 'বাউল', releaseYear: 1850, lyrics: 'এমন মানব জনম আর কি হবে' },
  { title: 'খাঁচার ভেতর অচিন পাখি', artist: 'বিভিন্ন বাউল', lyricist: 'লালন ফকির', genre: 'বাউল', releaseYear: 1850, lyrics: 'খাঁচার ভেতর অচিন পাখি' }, // Duplicate of earlier entry, ensure only one is kept or lyricist varied
  { title: 'কে কথা কয়রে দেখা দেয় না', artist: 'বিভিন্ন বাউল', lyricist: 'লালন ফকির', genre: 'বাউল', releaseYear: 1850, lyrics: 'কে কথা কয়রে দেখা দেয় না' },
  { title: 'আমার এ ঘরখানায় কে বিরাজ করে', artist: 'বিভিন্ন বাউল', lyricist: 'লালন ফকির', genre: 'বাউল', releaseYear: 1850, lyrics: 'আমার এ ঘরখানায় কে বিরাজ করে' },
  { title: 'সত্য বল সুপথে চল', artist: 'বিভিন্ন বাউল', lyricist: 'লালন ফকির', genre: 'বাউল', releaseYear: 1850, lyrics: 'সত্য বল সুপথে চল' },
  { title: 'দয়াল নিতাই কারো ফেলে যাবে না', artist: 'বিভিন্ন বাউল', lyricist: 'লালন ফকির', genre: 'বাউল', releaseYear: 1850, lyrics: 'দয়াল নিতাই কারো ফেলে যাবে না' },
  { title: 'পাবে সামান্যে কি তার দেখা', artist: 'বিভিন্ন বাউল', lyricist: 'লালন ফকির', genre: 'বাউল', releaseYear: 1850, lyrics: 'পাবে সামান্যে কি তার দেখা' },
  { title: 'তিন পাগলের হলো মেলা', artist: 'বিভিন্ন বাউল', lyricist: 'লালন ফকির', genre: 'বাউল', releaseYear: 1850, lyrics: 'তিন পাগলের হলো মেলা' },
  { title: 'আগে যদি জানতাম', artist: 'বিভিন্ন বাউল', lyricist: 'লালন ফকির', genre: 'বাউল', releaseYear: 1850, lyrics: 'আগে যদি জানতাম' },
  { title: 'আমার মন মানে না', artist: 'বিভিন্ন বাউল', lyricist: 'লালন ফকির', genre: 'বাউল', releaseYear: 1850, lyrics: 'আমার মন মানে না' },
  { title: 'মনের মানুষ পাইলাম না', artist: 'বিভিন্ন বাউল', lyricist: 'লালন ফকির', genre: 'বাউল', releaseYear: 1850, lyrics: 'মনের মানুষ পাইলাম না' },
  { title: 'আমার সোনার বাংলা (লালন)', artist: 'বিভিন্ন বাউল', lyricist: 'লালন ফকির', genre: 'বাউল', releaseYear: 1850, lyrics: 'আমার সোনার বাংলা (লালন সংস্করণ)' }, // Distinguish from Tagore's if necessary

  // প্রতুল মুখোপাধ্যায় - ওঠো হে আলবাম
  { title: 'ছোকরা চাঁদ জোওয়ান চাঁদ', artist: 'প্রতুল মুখোপাধ্যায়', lyricist: 'প্রতুল মুখোপাধ্যায়', genre: 'জীবনমুখী', releaseYear: 1990, lyrics: 'ছোকরা চাঁদ জোওয়ান চাঁদ (পাঠ সহ) ৩:৪৯' }, // Assuming 1990 as a placeholder year for album
  { title: 'লাল কমলা হলদে সবুজ', artist: 'প্রতুল মুখোপাধ্যায়', lyricist: 'প্রতুল মুখোপাধ্যায়', genre: 'জীবনমুখী', releaseYear: 1990, lyrics: 'লাল কমলা হলদে সবুজ ৩:২০' },
  { title: 'দারুণ গভীর থেকে', artist: 'প্রতুল মুখোপাধ্যায়', lyricist: 'প্রতুল মুখোপাধ্যায়', genre: 'জীবনমুখী', releaseYear: 1990, lyrics: 'দারুণ গভীর থেকে ৪:৫০' },
  { title: 'গিয়েছিলাম লোহার হাটে', artist: 'প্রতুল মুখোপাধ্যায়', lyricist: 'প্রতুল মুখোপাধ্যায়', genre: 'জীবনমুখী', releaseYear: 1990, lyrics: 'গিয়েছিলাম লোহার হাটে (পাঠ সহ) ২:৩০' },
  { title: 'কি আমদের জাত', artist: 'প্রতুল মুখোপাধ্যায়', lyricist: 'প্রতুল মুখোপাধ্যায়', genre: 'জীবনমুখী', releaseYear: 1990, lyrics: 'কি আমদের জাত ৫:০২' },
  { title: 'ভালোবাসার মানুষ', artist: 'প্রতুল মুখোপাধ্যায়', lyricist: 'প্রতুল মুখোপাধ্যায়', genre: 'জীবনমুখী', releaseYear: 1990, lyrics: 'ভালোবাসার মানুষ ৩:৫৪' },
  { title: 'কাঁচের বাসনের ঝান ঝন শব্দে', artist: 'প্রতুল মুখোপাধ্যায়', lyricist: 'প্রতুল মুখোপাধ্যায়', genre: 'জীবনমুখী', releaseYear: 1990, lyrics: 'কাঁচের বাসনের ঝান ঝন শব্দে ২:৩৫' },
  { title: 'মা সেলাই করে', artist: 'প্রতুল মুখোপাধ্যায়', lyricist: 'প্রতুল মুখোপাধ্যায়', genre: 'জীবনমুখী', releaseYear: 1990, lyrics: 'মা সেলাই করে ৪:৪১' },
  { title: 'সেই ছোট্ট দুটি পা', artist: 'প্রতুল মুখোপাধ্যায়', lyricist: 'প্রতুল মুখোপাধ্যায়', genre: 'জীবনমুখী', releaseYear: 1990, lyrics: 'সেই ছোট্ট দুটি পা ৫:৪৫' },
  { title: 'আমরা ধান কাটার গান গাই', artist: 'প্রতুল মুখোপাধ্যায়', lyricist: 'প্রতুল মুখোপাধ্যায়', genre: 'জীবনমুখী', releaseYear: 1990, lyrics: 'আমরা ধান কাটার গান গাই ৩:৪৩' },
  { title: 'নাকোসি স্কেলে আফ্রিকা', artist: 'প্রতুল মুখোপাধ্যায়', lyricist: 'প্রতুল মুখোপাধ্যায়', genre: 'জীবনমুখী', releaseYear: 1990, lyrics: 'নাকোসি স্কেলে আফ্রিকা ৪:৩২' },
  { title: 'তুই ছেঁড়া মাটির বুকে আছিস', artist: 'প্রতুল মুখোপাধ্যায়', lyricist: 'প্রতুল মুখোপাধ্যায়', genre: 'জীবনমুখী', releaseYear: 1990, lyrics: 'তুই ছেঁড়া মাটির বুকে আছিস ৩:৫২' },
  { title: 'এই তো জানু পেতে', artist: 'প্রতুল মুখোপাধ্যায়', lyricist: 'প্রতুল মুখোপাধ্যায়', genre: 'জীবনমুখী', releaseYear: 1990, lyrics: 'এই তো জানু পেতে ৪:৪৮' },
];

// Generate slugs and IDs for all songs
const mockSongs: Song[] = mockSongsData.map((song, index) => {
    const id = (index + 1).toString(); // Use index+1 as string for ID (1-based)

    const cleanedArtistString = cleanDisplayString(song.artist) || 'বিভিন্ন শিল্পী';
    const artistParts = cleanedArtistString
        .split(/[,;ওএবং&]+|\s+(?:ও|এবং)\s+/) // Split by common separators for multiple artists
        .map(part => {
            const cleanedPart = cleanString(part.trim());
            // Filter out parts that are only single Bengali diacritics AFTER cleaning
            // Regex ^[\u09BE-\u09C4]$ matches common Bengali diacritics like া, ি, ু etc. if they are the entire part.
            if (cleanedPart && /^[\u09BE-\u09C4]$/.test(cleanedPart)) {
                return null; // Mark for removal if it's just a standalone diacritic
            }
            return cleanedPart;
        })
        .filter(Boolean as (value: string | null) => value is string); // Remove nulls and empty strings from parts
    
    const artistKeyForSlug = artistParts.join('-') || cleanString(cleanedArtistString) || 'অজানা-শিল্পী';


    const lyricistKeyForSlug = cleanString(song.lyricist);
    const slug = createSlug(song.title, artistKeyForSlug, lyricistKeyForSlug, id);

    return {
        ...song,
        id: id,
        slug: slug,
        title: cleanDisplayString(song.title) || song.title, // Ensure stored title is also display-cleaned
        artist: cleanDisplayString(song.artist) || song.artist, // Ensure stored artist is also display-cleaned
        lyricist: song.lyricist ? cleanDisplayString(song.lyricist) : undefined,
        genre: song.genre ? cleanDisplayString(song.genre) : undefined,
        lyrics: cleanLyricsForDisplay(song.lyrics),
    };
});


// Helper function to ensure every listed lyricist has at least one song entry
function addPlaceholderSongsForMissingLyricists() {
    const allKnownLyricists = [
        'রবীন্দ্রনাথ ঠাকুর', 'কাজী নজরুল ইসলাম', 'দ্বিজেন্দ্রলাল রায়', 'রজনীকান্ত সেন', 'অতুলপ্রসাদ সেন',
        'হিমাংশু দত্ত', 'মুকুন্দ দাস', 'গগন হরকরা', 'কমলাকান্ত ভট্টাচার্য', 'নিধুবাবু (রামনিধি গুপ্ত)',
        'কালী মির্জা (কাজী জলিল)', 'রাধারমণ দত্ত', 'দাশরথি রায়', 'ভোলা ময়রা', 'অ্যান্থনি ফিরিঙ্গি',
        'কবি ভোলানাথ', 'কবি নীলকণ্ঠ', 'কবি ভবানীচরণ', 'কবি হরু ঠাকুর', 'কবি যতীন্দ্রমোহন বাগচী',
        'গৌরীপ্রসন্ন মজুমদার', 'শ্যামল গুপ্ত', 'প্রণব রায়', 'সুধীন দাশগুপ্ত', 'পুলক বন্দ্যোপাধ্যায়',
        'শৈলেন রায়', 'সলিল চৌধুরী', 'প্রেমেন্দ্র মিত্র', 'সুকুমার রায়', 'কাজী মোতাহার হোসেন',
        'শিবদাস বন্দ্যোপাধ্যায়', 'মুকুল দত্ত', 'অমিতাভ ভট্টাচার্য', 'অঞ্জন চৌধুরী', 'অনুপম দত্ত',
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
                lyricist: lyricist, // Store original lyricist name for display
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
    // Normalize both the stored slug and the decoded slug for comparison
    const normalizedDecodedSlug = cleanString(decodedSlug)?.normalize('NFC');
    const song = mockSongs.find(s => {
        const normalizedStoredSlug = cleanString(s.slug)?.normalize('NFC');
        return normalizedStoredSlug === normalizedDecodedSlug;
    });


    if (song) {
      return song;
    } else {
       // Fallback logic (kept for resilience, though ideally direct match should work with improved slug generation)
       const parts = decodedSlug.split('-by-');
       if (parts.length >= 2) {
           const titlePart = cleanString(parts[0]);
           const rest = parts[1];
           const artistAndLyricistParts = rest.split('-lyricist-');
           const artistPart = cleanString(artistAndLyricistParts[0]);
           
           let idPart: string | undefined;
           let lyricistPartFromSlug: string | undefined;

           if (artistAndLyricistParts[1]) { // Slug contains a lyricist
                const lyricistAndIdCombined = artistAndLyricistParts[1];
                const lastHyphenIndex = lyricistAndIdCombined.lastIndexOf('-');
                if (lastHyphenIndex !== -1 && lastHyphenIndex < lyricistAndIdCombined.length -1) {
                    lyricistPartFromSlug = cleanString(lyricistAndIdCombined.substring(0, lastHyphenIndex));
                    idPart = lyricistAndIdCombined.substring(lastHyphenIndex + 1);
                } else {
                    // If no ID part clearly separated by hyphen, assume the whole thing might be lyricist (or no ID)
                    lyricistPartFromSlug = cleanString(lyricistAndIdCombined);
                }
           } else { // Slug does not contain a lyricist
                const artistAndIdCombined = rest;
                const lastHyphenIndex = artistAndIdCombined.lastIndexOf('-');
                 if (lastHyphenIndex !== -1 && lastHyphenIndex < artistAndIdCombined.length -1) {
                    // Check if the part after last hyphen is numeric (potential ID)
                    const potentialId = artistAndIdCombined.substring(lastHyphenIndex + 1);
                    if (!isNaN(Number(potentialId))) { // Check if it's a number
                         idPart = potentialId;
                         // If there was an artist part before the ID
                         const artistOnlyPart = cleanString(artistAndIdCombined.substring(0, lastHyphenIndex));
                         if (artistOnlyPart !== artistPart) {
                             // This case is complex, might mean artist name itself contained hyphens
                             // For simplicity here, we'll rely on the initial artistPart split
                         }
                    } else {
                        // If not numeric, it might be part of the artist name or no ID
                    }
                } else {
                   // No clear ID part
                }
           }


           const potentialMatch = mockSongs.find(s => {
                const songTitleSlug = cleanString(s.title)?.toLowerCase();
                const songArtistSlug = cleanString(s.artist)?.toLowerCase();
                const songLyricistSlug = cleanString(s.lyricist)?.toLowerCase();

                const titleMatches = songTitleSlug === titlePart;
                const artistMatches = songArtistSlug === artistPart;
                const idMatches = s.id === idPart;
                const lyricistMatches = lyricistPartFromSlug ? songLyricistSlug === lyricistPartFromSlug : true; // If no lyricist in slug, don't filter by it

                return titleMatches && artistMatches && lyricistMatches && (idPart ? idMatches : true);
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

    // Use the already cleaned fields from the Song object
    const songTitleMatch = song.title?.toLowerCase() || "";
    const songArtists = (song.artist?.toLowerCase() || "").split(/[,;ওএবং&]+|\s+(?:ও|এবং)\s+/).map(a => a.trim()).filter(Boolean);
    const songLyricistMatch = song.lyricist?.toLowerCase() || "";
    const songGenreMatch = song.genre?.toLowerCase() || "";
    const songLyricsMatch = song.lyrics?.toLowerCase() || ""; // Assuming lyrics are stored cleaned

    const wordMatch = queryTokens.every(token => (
        songTitleMatch.includes(token) ||
        songArtists.some(artist => artist.includes(token)) ||
        songLyricistMatch.includes(token) ||
        songGenreMatch.includes(token) ||
        songLyricsMatch.includes(token)
    ));
    const slugMatch = song.slug.toLowerCase().startsWith(slugCleanedQuery);
    return wordMatch || slugMatch;
  });

  const rankedSongs = filteredSongs.map(song => {
    let matchCount = 0;
    const songTitleMatch = song.title?.toLowerCase() || "";
    const songArtists = (song.artist?.toLowerCase() || "").split(/[,;ওএবং&]+|\s+(?:ও|এবং)\s+/).map(a => a.trim()).filter(Boolean);
    const songLyricistMatch = song.lyricist?.toLowerCase() || "";

    queryTokens.forEach(token => {
      if (songTitleMatch.includes(token)) matchCount += 3;
      if (songArtists.some(artist => artist.includes(token))) matchCount += 2;
      if (songLyricistMatch.includes(token)) matchCount += 1;
    });

    if (songTitleMatch.includes(displayCleanedQuery)) matchCount += 5;
    if (songArtists.some(artist => artist.includes(displayCleanedQuery))) matchCount += 4;
    if (songLyricistMatch.includes(displayCleanedQuery)) matchCount += 3;
    if (song.slug.toLowerCase().startsWith(slugCleanedQuery)) matchCount += 2;

    return { ...song, matchCount };
  }).sort((a, b) => (b.matchCount || 0) - (a.matchCount || 0));

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
        // Use cleaned fields for matching
        return mockSongs.find(s =>
            s.title === cleanDisplayString(def.title) &&
            (s.artist?.split(/[,;ওএবং&]+|\s+(?:ও|এবং)\s+/).map(a=>a.trim()).includes(cleanDisplayString(def.artist) || "") || s.artist === cleanDisplayString(def.artist)) &&
            s.lyricist === cleanDisplayString(def.lyricist) &&
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
  splitCombined: boolean = false // Only for artist field
): Promise<string[]> {
  try {
    const valuesSet = new Set<string>();
    mockSongs.forEach(song => {
      // Use the already cleaned field from the Song object
      const rawValue = song[fieldName] as string | undefined;

      if (song.genre === 'Placeholder' && (fieldName === 'artist' || fieldName === 'genre')) {
          // For lyricists, we want to include placeholders to show all known lyricists
          if (fieldName === 'lyricist' && rawValue) {
            valuesSet.add(rawValue); // Add the original lyricist name from placeholder
          }
          return;
      }


      if (rawValue) {
        let valuesToAdd: string[] = [];
        if (splitCombined && fieldName === 'artist') {
             valuesToAdd = rawValue.split(/[,;ওএবং&]+|\s+(?:ও|এবং)\s+/).map(namePart => cleanDisplayString(namePart.trim()) || "").filter(Boolean);
        } else {
            valuesToAdd.push(cleanDisplayString(rawValue) || "");
        }
         valuesToAdd.filter((cleanedVal): cleanedVal is string => !!cleanedVal)
                   .forEach(finalVal => valuesSet.add(finalVal));
      }
    });
    const uniqueValues = Array.from(valuesSet);
    const filteredValues = uniqueValues.filter(val => val !== 'Placeholder' && val.toLowerCase() !== 'various artists' && val !== 'বিভিন্ন শিল্পী');

    if (uniqueValues.some(val => val.toLowerCase() === 'various artists' || val === 'বিভিন্ন শিল্পী') && !filteredValues.includes('বিভিন্ন শিল্পী')) {
        if (mockSongs.some(s => s.artist === 'বিভিন্ন শিল্পী')) {
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
    const artists = await getUniqueFieldValues('artist', true);
    const priorityOrder = ['রবীন্দ্রনাথ ঠাকুর', 'কাজী নজরুল ইসলাম', 'ভূপেন হাজারিকা', 'বিভিন্ন শিল্পী'];
    return artists.sort((a, b) => {
        const aCleaned = a; 
        const bCleaned = b; 
        const aPriority = priorityOrder.indexOf(aCleaned);
        const bPriority = priorityOrder.indexOf(bCleaned);

        if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
        if (aPriority !== -1) return -1;
        if (bPriority !== -1) return 1;
        return aCleaned.localeCompare(bCleaned, 'bn');
    });
}


export async function getAllGenres(): Promise<string[]> {
  return getUniqueFieldValues('genre');
}

export async function getAllLyricists(): Promise<string[]> {
  const lyricists = await getUniqueFieldValues('lyricist');
  const priorityOrder = ['রবীন্দ্রনাথ ঠাকুর', 'কাজী নজরুল ইসলাম', 'দ্বিজেন্দ্রলাল রায়', 'রজনীকান্ত সেন', 'অতুলপ্রসাদ সেন', 'সংগৃহীত'];
  return lyricists.sort((a, b) => {
    const aCleaned = a; 
    const bCleaned = b; 
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

// This function is for a real database, not used with mock data.
export async function seedDatabase() {
  console.log("Mock database: seedDatabase called, but no action is taken.");
  // If you were to implement this for a real database (e.g., Firestore):
  // 1. Connect to your database.
  // 2. Iterate through `mockSongsData` (or a more comprehensive dataset).
  // 3. For each song, generate its slug and ID similar to how it's done for `mockSongs`.
  // 4. Add the song object (with id, slug, cleaned fields) to your database.
  // Ensure to handle batch writes or individual writes appropriately for your DB.
  return Promise.resolve();
}

// Final check to ensure mockSongs is correctly populated
console.log(`Final mockSongs count after placeholder check: ${mockSongs.length}`);
