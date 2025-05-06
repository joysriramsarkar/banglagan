'use server';

/**
 * @fileOverview Song suggestion flow based on user history.
 *
 * - suggestSongsBasedOnHistory - A function that suggests songs based on user's search history.
 * - SuggestSongsInput - The input type for the suggestSongsBasedOnHistory function.
 * - SuggestSongsOutput - The return type for the suggestSongsBasedOnHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {searchSongs, Song} from '@/services/bangla-song-database';

const SuggestSongsInputSchema = z.object({
  searchHistory: z
    .string()
    .describe('The user search history, comma separated.'),
});
export type SuggestSongsInput = z.infer<typeof SuggestSongsInputSchema>;

const SuggestSongsOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      title: z.string().describe('The title of the song.'),
      artist: z.string().describe('The artist of the song.'),
    })
  ).
describe('List of song suggestions based on search history'),
});
export type SuggestSongsOutput = z.infer<typeof SuggestSongsOutputSchema>;

export async function suggestSongsBasedOnHistory(input: SuggestSongsInput): Promise<SuggestSongsOutput> {
  return suggestSongsBasedOnHistoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSongsPrompt',
  input: {schema: SuggestSongsInputSchema},
  output: {schema: SuggestSongsOutputSchema},
  prompt: `ব্যবহারকারীর অনুসন্ধানের ইতিহাসের উপর ভিত্তি করে, তিনটি বাংলা গান প্রস্তাব করুন যা ব্যবহারকারী উপভোগ করতে পারে।

অনুসন্ধানের ইতিহাস: {{{searchHistory}}}

JSON ফরম্যাটে প্রস্তাবনাগুলি ফেরত দিন।

{
  "suggestions": [
      {
          "title": "গানের শিরোনাম",
          "artist": "শিল্পীর নাম"
      }
  ]
}`,
});

const suggestSongsBasedOnHistoryFlow = ai.defineFlow(
  {
    name: 'suggestSongsBasedOnHistoryFlow',
    inputSchema: SuggestSongsInputSchema,
    outputSchema: SuggestSongsOutputSchema,
  },
  async input => {
    // First, search for the songs in the search history.
    const searchQueries = input.searchHistory.split(',');
    const searchResults: Song[][] = await Promise.all(
      searchQueries.map(async query => {
        return await searchSongs(query);
      })
    );

    // Flatten the search results into a single array.
    const allSongs = searchResults.flat();

    // Extract the song titles and artists from the search results.
    const songInfo = allSongs.map(song => `${song.title} - ${song.artist}`).join(', '); // Changed 'by' to '-' for potentially better LLM understanding

    // Pass the song information to the prompt.
    const {output} = await prompt({
      searchHistory: songInfo,
    });
    return output!;
  }
);
