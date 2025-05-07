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
  try {
    let decodedSlug = '';
    try {
         decodedSlug = decodeURIComponent(params.slug);
    } catch (e) {
        console.warn(`generateMetadata: Error decoding slug "${params.slug}", using as is. Error:`, e);
        decodedSlug = params.slug; // Fallback if decoding fails
    }


    console.log(`generateMetadata: Attempting to fetch song with decoded slug: ${decodedSlug}`);
    const song = await getSongBySlug(decodedSlug); // Use the mock service

    if (!song) {
       console.error(`generateMetadata: Song not found for decoded slug: ${decodedSlug}`);
      return {
        title: 'গান পাওয়া যায়নি - বাংলা গান',
        description: 'আপনি যে গানটি খুঁজছেন তা পাওয়া যায়নি।',
      };
    }

    const metaTitle = cleanDisplayString(song.title) || 'শিরোনামহীন গান';
    const metaArtist = cleanDisplayString(song.artist) || 'অজানা শিল্পী';

    // Optionally inheriting parent metadata (e.g., from root layout)
    // const previousImages = (await parent).openGraph?.images || []

    return {
      title: `${metaTitle} - ${metaArtist} | বাংলা গান`,
      description: `${metaTitle} গানের তথ্য ও লিরিক্স (যদি থাকে) ব্রাউজ করুন। শিল্পী: ${metaArtist}।`,
      openGraph: {
        title: `${metaTitle} - ${metaArtist} | বাংলা গান`,
        description: `গানের বিবরণ এবং লিরিক্স (যদি উপলব্ধ থাকে)।`,
        // images: ['/some-specific-song-image.jpg', ...previousImages], // Example of adding image
      },
    };
  } catch (error) {
    console.error(`generateMetadata: Error for slug ${params.slug}:`, error);
    return {
      title: 'তথ্য লোড করতে সমস্যা - বাংলা গান',
      description: 'গানটির তথ্য এই মুহূর্তে আনা সম্ভব হচ্ছে না।',
    };
  }
}
