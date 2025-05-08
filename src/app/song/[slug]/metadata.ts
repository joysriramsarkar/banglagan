import type { Metadata, ResolvingMetadata } from 'next';
import { getSongBySlug } from '@/services/bangla-song-database';
import { cleanDisplayString } from '@/lib/utils';

interface SongPageProps {
  params: {
    slug: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata(
  { params }: SongPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const rawSlug = params.slug;
  let decodedSlug = '';

  if (!rawSlug || typeof rawSlug !== 'string' || rawSlug.trim() === '') {
     console.warn(`generateMetadata: Invalid or empty slug provided: "${rawSlug}"`);
     return {
       title: 'অবৈধ লিঙ্ক - বাংলা গান',
       description: 'গানটির লিঙ্কটি সঠিক নয়।',
     };
  }

  try {
    decodedSlug = decodeURIComponent(rawSlug);
  } catch (e) {
    console.warn(`generateMetadata: Error decoding slug "${rawSlug}", using as is. Error:`, e);
    decodedSlug = rawSlug; // Use raw slug if decoding fails
  }

  try {
    const song = await getSongBySlug(decodedSlug);

    if (!song) {
       console.error(`generateMetadata: Song not found for decoded slug: ${decodedSlug} (raw: ${rawSlug})`);
       return {
         title: 'গান পাওয়া যায়নি - বাংলা গান',
         description: 'আপনি যে গানটি খুঁজছেন তা পাওয়া যায়নি।',
       };
    }

    const rawMetaTitle = cleanDisplayString(song.title) || 'শিরোনামহীন গান';
    const metaTitle = rawMetaTitle.replace(/-/g, ' ');
    const metaArtist = cleanDisplayString(song.artist) || 'অজানা শিল্পী';

    return {
      title: `${metaTitle} - ${metaArtist} | বাংলা গান`,
      description: `${metaTitle} গানের তথ্য ও লিরিক্স (যদি থাকে) ব্রাউজ করুন। শিল্পী: ${metaArtist}।`,
      openGraph: {
        title: `${metaTitle} - ${metaArtist} | বাংলা গান`,
        description: `গানের বিবরণ এবং লিরিক্স (যদি উপলব্ধ থাকে)।`,
      },
    };
  } catch (error) {
    console.error(`generateMetadata: Error fetching metadata for decoded slug ${decodedSlug} (raw: ${rawSlug}):`, error);
    return {
      title: 'তথ্য লোড করতে সমস্যা - বাংলা গান',
      description: 'গানটির তথ্য এই মুহূর্তে আনা সম্ভব হচ্ছে না।',
    };
  }
}
