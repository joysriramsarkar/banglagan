
'use server';

import { mockSongs, type Song } from '@/data/all-songs';
import { cleanString as cleanStringForSlugProcessing, cleanDisplayString } from '@/lib/utils';
// Note: `createSlug` is used in `all-songs.ts` now.
// Note: `cleanLyricsForDisplay` is used in `all-songs.ts` now.

export { type Song } from '@/data/all-songs';


export async function getAllSongs(): Promise<Song[]> {
  try {
    return mockSongs.filter(song => song.genre !== 'Placeholder');
  } catch (error: any) {
    return [];
  }
}

export async function getSongBySlug(slugFromUrl: string): Promise<Song | undefined> {
  if (!slugFromUrl || typeof slugFromUrl !== 'string' || !slugFromUrl.trim()) {
    return undefined;
  }
  const slugToSearch = slugFromUrl.trim().toLowerCase();
  const song = mockSongs.find(s => s.slug === slugToSearch);

  if (!song) {
    return undefined;
  }
  if (song.genre === 'Placeholder') return undefined;
  return song;
}


export async function searchSongs(searchQuery: string): Promise<Song[]> {
  if (!searchQuery || !searchQuery.trim()) {
    return [];
  }

  const cleanedQueryForMatching = cleanStringForSlugProcessing(searchQuery, "").toLowerCase();
  const queryTokens = cleanedQueryForMatching.split('-').filter(token => token.length > 0);

  const filteredSongs = mockSongs.filter(song => {
    if (song.genre === 'Placeholder') return false;

    const songTitleSlug = cleanStringForSlugProcessing(song.originalTitle, "").toLowerCase();
    const songArtistSlug = cleanStringForSlugProcessing(song.originalArtist, "").toLowerCase();
    const songLyricistSlug = cleanStringForSlugProcessing(song.originalLyricist, "").toLowerCase();
    const songComposerSlug = cleanStringForSlugProcessing(song.originalComposer, "").toLowerCase();
    const songGenreSlug = cleanStringForSlugProcessing(song.originalGenre, "").toLowerCase();

    const songContentForTokenMatching = [
      songTitleSlug,
      songArtistSlug,
      songLyricistSlug,
      songComposerSlug,
      songGenreSlug,
    ].join(' '); 

    if (queryTokens.every(token => songContentForTokenMatching.includes(token))) {
      return true;
    }

    const cleanedQueryDisplayLower = (cleanDisplayString(searchQuery) || "").toLowerCase();
    if (
      (song.title?.toLowerCase() || "").includes(cleanedQueryDisplayLower) ||
      (song.artist?.toLowerCase() || "").includes(cleanedQueryDisplayLower) ||
      (song.lyricist?.toLowerCase() || "").includes(cleanedQueryDisplayLower) ||
      (song.composer?.toLowerCase() || "").includes(cleanedQueryDisplayLower) ||
      (song.genre?.toLowerCase() || "").includes(cleanedQueryDisplayLower)
    ) {
      return true;
    }
    return false;
  });

  const rankedSongs = filteredSongs.map(song => {
    let matchCount = 0;
    const queryLower = (cleanDisplayString(searchQuery) || "").toLowerCase(); 
    const querySlugLower = cleanStringForSlugProcessing(searchQuery, "").toLowerCase(); 

    if (cleanStringForSlugProcessing(song.originalTitle, "").toLowerCase().includes(querySlugLower)) matchCount += 10;
    if (cleanStringForSlugProcessing(song.originalArtist, "").toLowerCase().includes(querySlugLower)) matchCount += 5;
    if (cleanStringForSlugProcessing(song.originalLyricist, "").toLowerCase().includes(querySlugLower)) matchCount += 3;
    if (cleanStringForSlugProcessing(song.originalComposer, "").toLowerCase().includes(querySlugLower)) matchCount += 2;
    if (cleanStringForSlugProcessing(song.originalGenre, "").toLowerCase().includes(querySlugLower)) matchCount += 1;

    if ((song.title?.toLowerCase() || "").includes(queryLower) && matchCount < 10) matchCount += 8;
    if ((song.artist?.toLowerCase() || "").includes(queryLower) && matchCount < 5) matchCount += 4;
    if ((song.lyricist?.toLowerCase() || "").includes(queryLower) && matchCount < 3) matchCount += 2;

    return { ...song, matchCount };
  }).sort((a, b) => (b.matchCount || 0) - (a.matchCount || 0));

  return rankedSongs;
}


export async function getPopularSongs(): Promise<Song[]> {
  const popularSongDefinitions = [
    { title: 'আমার সোনার বাংলা', artist: 'বিভিন্ন শিল্পী', lyricist: 'রবীন্দ্রনাথ ঠাকুর', composer: 'রবীন্দ্রনাথ ঠাকুর' },
    { title: 'যদি তোর ডাক শুনে কেউ না আসে', artist: 'বিভিন্ন শিল্পী', lyricist: 'রবীন্দ্রনাথ ঠাকুর', composer: 'রবীন্দ্রনাথ ঠাকুর' },
    { title: 'একতারা তুই দেশের কথা', artist: 'শাহনাজ রহমতউল্লাহ', lyricist: 'গাজী মাজহারুল আনোয়ার', composer: 'আনোয়ার পারভেজ' },
    { title: 'কফি হাউসের সেই আড্ডাটা', artist: 'মান্না দে', lyricist: 'গৌরীপ্রসন্ন মজুমদার', composer: 'সুপর্ণকান্তি ঘোষ' },
    { title: 'মানুষ মানুষের জন্যে', artist: 'ভূপেন হাজারিকা', lyricist: 'ভূপেন হাজারিকা', composer: 'ভূপেন হাজারিকা' },
  ];

  let popular: Song[] = [];

  try {
    popular = popularSongDefinitions.map(def => {
      const searchTitleRaw = def.title;
      const searchArtistRaw = def.artist;
      const searchLyricistRaw = def.lyricist;
      const searchComposerRaw = def.composer;

      return mockSongs.find(s =>
        s.originalTitle === searchTitleRaw &&
        s.originalArtist === searchArtistRaw &&
        s.originalLyricist === searchLyricistRaw &&
        s.originalComposer === searchComposerRaw &&
        s.genre !== 'Placeholder'
      );
    }).filter((song): song is Song => song !== undefined);


    if (popular.length < popularSongDefinitions.length) {
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
  } catch (error: any) {
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
    return [];
  }
}


async function getUniqueFieldValues(
  conceptualFieldName: 'artist' | 'genre' | 'lyricist' | 'composer',
  splitCombined: boolean = false
): Promise<string[]> {
  try {
    const valuesSet = new Set<string>();
    mockSongs.forEach(song => {
      if (song.genre === 'Placeholder' && conceptualFieldName !== 'lyricist') {
        return;
      }

      let originalSourceValue: string | undefined;

      switch (conceptualFieldName) {
        case 'artist': originalSourceValue = song.originalArtist; break;
        case 'genre': originalSourceValue = song.originalGenre; break;
        case 'lyricist': originalSourceValue = song.originalLyricist; break;
        case 'composer': originalSourceValue = song.originalComposer; break;
      }

      if (!originalSourceValue || originalSourceValue.toLowerCase() === 'placeholder') {
        return;
      }

      let valuesToProcess: string[] = [];
      if (splitCombined && (conceptualFieldName === 'artist' || conceptualFieldName === 'lyricist' || conceptualFieldName === 'composer')) {
        valuesToProcess = originalSourceValue.split(/[,;\/\\]+|\s+ও\s+|\s+এবং\s+/)
          .map(part => cleanDisplayString(part.trim()))
          .filter((cleanedPart): cleanedPart is string => !!cleanedPart && cleanedPart.length > 0 && cleanedPart.toLowerCase() !== 'placeholder' && cleanedPart.toLowerCase() !== 'undefined');
      } else {
        const cleanedItem = cleanDisplayString(originalSourceValue.trim());
        if (cleanedItem && cleanedItem.toLowerCase() !== 'placeholder' && cleanedItem.toLowerCase() !== 'undefined') {
          valuesToProcess.push(cleanedItem);
        }
      }

      valuesToProcess.forEach(item => {
        const itemLower = item.toLowerCase();
        if (itemLower === 'বিভিন্ন শিল্পী' || itemLower === 'various artists' || itemLower === 'various') valuesSet.add('বিভিন্ন শিল্পী');
        else if (itemLower === 'অজানা শিল্পী' || itemLower === 'unknown artist') valuesSet.add('অজানা শিল্পী');
        else if (itemLower === 'অজানা গীতিকার' || itemLower === 'unknown lyricist') valuesSet.add('অজানা গীতিকার');
        else if (itemLower === 'অজানা সুরকার' || itemLower === 'unknown composer') valuesSet.add('অজানা সুরকার');
        else if (itemLower === 'অজানা ধরণ' || itemLower === 'unknown genre') valuesSet.add('অজানা ধরণ');
        else if (itemLower === 'সংগৃহীত' || itemLower === 'collected') valuesSet.add('সংগৃহীত');
        else if (itemLower === 'প্রচলিত' || itemLower === 'traditional') valuesSet.add('প্রচলিত');
        else {
          valuesSet.add(item);
        }
      });
    });

    if (valuesSet.has('নিরেন্দ্রনাথ চক্রবর্তী') && valuesSet.has('নীরেন্দ্রনাথ চক্রবর্তী')) {
      valuesSet.delete('নিরেন্দ্রনাথ চক্রবর্তী');
    }

    return Array.from(valuesSet)
      .filter(val => val && val.trim() !== '' && val.toLowerCase() !== 'placeholder' && val.toLowerCase() !== 'undefined')
      .sort((a, b) => {
        const isABengali = /[\u0980-\u09FF]/.test(a);
        const isBBengali = /[\u0980-\u09FF]/.test(b);
        if (isABengali && !isBBengali) return -1;
        if (!isABengali && isBBengali) return 1;
        return a.localeCompare(b, 'bn');
      });

  } catch (error: any) {
    return [];
  }
}

export async function getAllArtists(): Promise<string[]> {
  const artists = await getUniqueFieldValues('artist', true);
  const priorityOrder = ['রবীন্দ্রনাথ ঠাকুর', 'কাজী নজরুল ইসলাম', 'ভূপেন হাজারিকা', 'বিভিন্ন শিল্পী', 'অজানা শিল্পী'];
  return artists.sort((a, b) => {
    const aPriority = priorityOrder.indexOf(a);
    const bPriority = priorityOrder.indexOf(b);

    if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
    if (aPriority !== -1) return -1;
    if (bPriority !== -1) return 1;
    return a.localeCompare(b, 'bn');
  });
}

export async function getAllGenres(): Promise<string[]> {
  return getUniqueFieldValues('genre');
}

export async function getAllLyricists(): Promise<string[]> {
  const lyricists = await getUniqueFieldValues('lyricist', true);
  const priorityOrder = ['রবীন্দ্রনাথ ঠাকুর', 'কাজী নজরুল ইসলাম', 'দ্বিজেন্দ্রলাল রায়', 'রজনীকান্ত সেন', 'অতুলপ্রসাদ সেন', 'সংগৃহীত', 'অজানা গীতিকার'];
  return lyricists.sort((a, b) => {
    const aPriority = priorityOrder.indexOf(a);
    const bPriority = priorityOrder.indexOf(b);

    if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
    if (aPriority !== -1) return -1;
    if (bPriority !== -1) return 1;
    return a.localeCompare(b, 'bn');
  });
}

export async function getAllComposers(): Promise<string[]> {
  const composers = await getUniqueFieldValues('composer', true);
  const priorityOrder = ['রবীন্দ্রনাথ ঠাকুর', 'কাজী নজরুল ইসলাম', 'সলিল চৌধুরী', 'হেমন্ত মুখোপাধ্যায়', 'সংগৃহীত', 'প্রচলিত', 'অজানা সুরকার'];
  return composers.sort((a, b) => {
    const aPriority = priorityOrder.indexOf(a);
    const bPriority = priorityOrder.indexOf(b);

    if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
    if (aPriority !== -1) return -1;
    if (bPriority !== -1) return 1;
    return a.localeCompare(b, 'bn');
  });
}

export async function getPaginatedSongs(page: number, limitPerPage: number): Promise<{ songs: Song[], nextPageCursor: null }> {
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

// This function is for a real database, not used with mock data.
export async function seedDatabase() {
  return Promise.resolve();
}

    