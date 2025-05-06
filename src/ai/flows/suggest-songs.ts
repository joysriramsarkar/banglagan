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
  prompt: `Based on the user's search history, suggest three songs that the user might enjoy.

Search History: {{{searchHistory}}}

Return the suggestions in JSON format.

{
  "suggestions": [
      {
          "title": "song title",
          "artist": "artist name"
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
    const songInfo = allSongs.map(song => `${song.title} by ${song.artist}`).join(', ');

    // Pass the song information to the prompt.
    const {output} = await prompt({
      searchHistory: songInfo,
    });
    return output!;
  }
);
