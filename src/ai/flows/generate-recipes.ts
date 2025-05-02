'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating Indian recipes based on a vegetable input (image or name).
 *
 * - generateRecipes - A function that takes a vegetable name or image and returns 5 Indian recipes with estimated cooking time, protein content, and YouTube video links.
 * - GenerateRecipesInput - The input type for the generateRecipes function.
 * - GenerateRecipesOutput - The return type for the generateRecipes function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {getYouTubeVideos, YouTubeVideo} from '@/services/youtube';

const GenerateRecipesInputSchema = z.object({
  vegetableName: z.string().optional().describe('The name of the vegetable.'),
  vegetableImage: z
    .string()
    .optional()
    .describe(
      "A photo of a vegetable, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateRecipesInput = z.infer<typeof GenerateRecipesInputSchema>;

const RecipeSchema = z.object({
  name: z.string().describe('The name of the recipe.'),
  ingredients: z.string().describe('A list of ingredients required for the recipe.'),
  instructions: z.string().describe('Step-by-step instructions for preparing the recipe.'),
  estimatedCookingTime: z.string().describe('The estimated cooking time for the recipe (e.g., 30 minutes).'),
  proteinContent: z.string().describe('The estimated protein content per serving (e.g., 15g).'),
  youtubeVideos: z.array(z.object({
    title: z.string(),
    url: z.string(),
  })).describe('list of youtube videos url'),
});

const GenerateRecipesOutputSchema = z.object({
  recipes: z.array(RecipeSchema).describe('An array of 5 Indian recipes.'),
});
export type GenerateRecipesOutput = z.infer<typeof GenerateRecipesOutputSchema>;

export async function generateRecipes(input: GenerateRecipesInput): Promise<GenerateRecipesOutput> {
  return generateRecipesFlow(input);
}

const recipePrompt = ai.definePrompt({
  name: 'recipePrompt',
  input: {
    schema: z.object({
      vegetableName: z.string().optional().describe('The name of the vegetable.'),
      vegetableImage: z
        .string()
        .optional()
        .describe(
          "A photo of a vegetable, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    }),
  },
  output: {
    schema: z.object({
      recipes: z.array(RecipeSchema).describe('An array of 5 Indian recipes.'),
    }),
  },
  prompt: `You are an expert Indian chef. Generate 5 different Indian recipes based on the provided vegetable.

      For each recipe, provide:
      - name: The name of the recipe.
      - ingredients: A list of ingredients required for the recipe.
      - instructions: Step-by-step instructions for preparing the recipe.
      - estimatedCookingTime: The estimated cooking time for the recipe (e.g., 30 minutes).
      - proteinContent: The estimated protein content per serving (e.g., 15g).

      {{#if vegetableName}}
      The vegetable is: {{{vegetableName}}}
      {{/if}}

      {{#if vegetableImage}}
      The vegetable image is: {{media url=vegetableImage}}
      {{/if}}

      Format the response as a JSON object that conforms to the RecipeSchema.

      Make sure each recipe includes a estimatedCookingTime and proteinContent.
      For each recipe, fetch the YouTube videos and populate the youtubeVideos array.

      The output should be a valid JSON array of recipes.
  `,
});

const generateRecipesFlow = ai.defineFlow<
  typeof GenerateRecipesInputSchema,
  typeof GenerateRecipesOutputSchema
>(
  {
    name: 'generateRecipesFlow',
    inputSchema: GenerateRecipesInputSchema,
    outputSchema: GenerateRecipesOutputSchema,
  },
  async input => {
    const recipeOutput = await recipePrompt(input);
    const recipes = recipeOutput.output?.recipes || [];

    // Fetch YouTube videos for each recipe
    const recipesWithVideos = await Promise.all(
      recipes.map(async recipe => {
        const youtubeVideos = await getYouTubeVideos(recipe.name);
        return {...recipe, youtubeVideos};
      })
    );

    return {recipes: recipesWithVideos};
  }
);
