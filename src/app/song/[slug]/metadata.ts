
import type { Metadata, ResolvingMetadata } from 'next';
import { getSongBySlug } from '@/services/bangla-song-database';
import { cleanDisplayString } from '@/lib/utils'; // cleanDisplayString for metadata titles

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

  if (!rawSlug || typeof rawSlug !== 'string' || rawSlug.trim() === '') {
    //  console.warn(`generateMetadata: Invalid or empty slug provided: "${rawSlug}"`);
     return {
       title: 'অবৈধ লিঙ্ক - বাংলা গান',
       description: 'গানটির লিঙ্কটি সঠিক নয়।',
     };
  }

  // Slug from params is already URI-decoded by Next.js.
  // getSongBySlug will internally use cleanString to match the stored slug format.
  const slugToFetch = rawSlug.trim();

  try {
    const song = await getSongBySlug(slugToFetch);

    if (!song) {
      //  console.error(`generateMetadata: Song not found for slug: ${slugToFetch}`);
       return {
         title: 'গান পাওয়া যায়নি - বাংলা গান',
         description: 'আপনি যে গানটি খুঁজছেন তা পাওয়া যায়নি।',
       };
    }

    // Use display-cleaned values for metadata
    const metaTitle = song.title || 'শিরোনামহীন গান'; // song.title is already display-cleaned
    const metaArtist = song.artist || 'অজানা শিল্পী'; // song.artist is already display-cleaned

    return {
      title: `${metaTitle} - ${metaArtist} | বাংলা গান`,
      description: `${metaTitle} গানের তথ্য ও লিরিক্স (যদি থাকে) ব্রাউজ করুন। শিল্পী: ${metaArtist}।`,
      openGraph: {
        title: `${metaTitle} - ${metaArtist} | বাংলা গান`,
        description: `গানের বিবরণ এবং লিরিক্স (যদি উপলব্ধ থাকে)।`,
      },
    };
  } catch (error) {
    // console.error(`generateMetadata: Error fetching metadata for slug ${slugToFetch}:`, error);
    return {
      title: 'তথ্য লোড করতে সমস্যা - বাংলা গান',
      description: 'গানটির তথ্য এই মুহূর্তে আনা সম্ভব হচ্ছে না।',
    };
  }
}
