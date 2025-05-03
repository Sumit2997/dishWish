'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating Indian recipes based on a vegetable input (image or name).
 *
 * - generateRecipes - A function that takes a vegetable name or image and returns 5 Indian recipes with estimated cooking time, protein content, YouTube video links, and an image prompt.
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
  })).min(1).describe('A list of at least one relevant YouTube video with title and URL.'), // Ensure at least one video
  imagePrompt: z.string().describe('A short, descriptive prompt suitable for generating an image of the finished dish (e.g., "A bowl of steaming Palak Paneer with naan bread").'),
});

const GenerateRecipesOutputSchema = z.object({
  recipes: z.array(RecipeSchema).describe('An array of 5 Indian recipes.'),
});
export type GenerateRecipesOutput = z.infer<typeof GenerateRecipesOutputSchema>;

export async function generateRecipes(input: GenerateRecipesInput): Promise<GenerateRecipesOutput> {
  return generateRecipesFlow(input);
}

// Define the tool for YouTube video search
const findYoutubeVideosTool = ai.defineTool(
  {
    name: 'findYoutubeVideos',
    description: 'Find relevant YouTube cooking videos for a given recipe name.',
    inputSchema: z.object({ query: z.string().describe('The recipe name to search for on YouTube.') }),
    outputSchema: z.array(z.object({ title: z.string(), url: z.string() })).describe('List of YouTube videos with titles and URLs'),
  },
  async ({ query }) => {
    // Use the existing service function
    return getYouTubeVideos(query);
  }
);


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
    // Note: The output schema here doesn't include youtubeVideos directly,
    // as the LLM will use the tool to get them. We'll add them in the flow.
    schema: z.object({
      recipes: z.array(
        // Omitting youtubeVideos from the direct output schema for the prompt,
        // as the tool will provide this.
         RecipeSchema.omit({ youtubeVideos: true })
      ).describe('An array of 5 Indian recipes.'),
    }),
  },
  // Provide the tool to the prompt
  tools: [findYoutubeVideosTool],
  prompt: `You are an expert Indian chef. Generate 5 different Indian recipes based on the provided vegetable.

      For each recipe, you **must** provide:
      - name: The name of the recipe.
      - ingredients: A list of ingredients required for the recipe.
      - instructions: Step-by-step instructions for preparing the recipe.
      - estimatedCookingTime: The estimated cooking time for the recipe (e.g., 30 minutes).
      - proteinContent: The estimated protein content per serving (e.g., 15g).
      - imagePrompt: A short, descriptive prompt suitable for generating an image of the finished dish (e.g., "A bowl of steaming Palak Paneer with naan bread").

      {{#if vegetableName}}
      The vegetable is: {{{vegetableName}}}
      {{/if}}

      {{#if vegetableImage}}
      The vegetable image is: {{media url=vegetableImage}}
      {{/if}}

      **Crucially, for each generated recipe, you MUST use the 'findYoutubeVideos' tool to find at least one relevant YouTube cooking video.** Provide the recipe name as the query to the tool.

      Format the response as a JSON object conforming to the specified output schema (excluding youtubeVideos, as the tool handles that).

      Make sure each recipe includes an estimatedCookingTime, proteinContent, and an imagePrompt.
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
    const llmResponse = await recipePrompt(input);
    const generatedRecipes = llmResponse.output?.recipes || [];

    // Process tool calls to get YouTube videos
    const recipesWithVideos: GenerateRecipesOutput['recipes'] = [];

    for (const recipe of generatedRecipes) {
       // Find the tool requests associated with this recipe's name in the LLM response history
       let youtubeVideos: YouTubeVideo[] = [];
       for (const req of llmResponse.history ?? []) {
         if (req.role === 'model' && req.content) {
            for (const part of req.content) {
               if (part.toolRequest && part.toolRequest.name === 'findYoutubeVideos' && part.toolRequest.input?.query === recipe.name) {
                 // Find the corresponding tool response
                 const toolResponsePart = llmResponse.history?.find(
                   (resp) => resp.role === 'tool' && resp.content.some(
                     (p) => p.toolResponse && p.toolResponse.ref === part.toolRequest?.ref
                   )
                 )?.content.find((p) => p.toolResponse && p.toolResponse.ref === part.toolRequest?.ref)?.toolResponse;

                 if (toolResponsePart?.output) {
                    // Assuming the tool output matches the YouTubeVideo[] structure
                    youtubeVideos = toolResponsePart.output as YouTubeVideo[];
                    break; // Found videos for this recipe
                 }
               }
            }
         }
          if (youtubeVideos.length > 0) break; // Stop searching history once videos are found
       }

        // Fallback if tool didn't run or failed (though prompt mandates it)
        if (youtubeVideos.length === 0) {
           console.warn(`YouTube tool did not return videos for recipe: ${recipe.name}. Fetching manually.`);
           youtubeVideos = await getYouTubeVideos(recipe.name);
         }

        // Ensure at least one video exists, otherwise add a default placeholder
        if (youtubeVideos.length === 0) {
          youtubeVideos = [{
              title: `Learn more about ${recipe.name}`,
              url: `https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.name + ' recipe')}`,
            }];
         }


        recipesWithVideos.push({
          ...recipe,
          youtubeVideos: youtubeVideos,
        });
    }


     // Ensure we always return exactly 5 recipes, padding if necessary (though unlikely)
    while (recipesWithVideos.length < 5 && recipesWithVideos.length > 0) {
       console.warn('AI generated fewer than 5 recipes. Duplicating last recipe to meet count.');
       recipesWithVideos.push({...recipesWithVideos[recipesWithVideos.length - 1]});
     }

    if (recipesWithVideos.length === 0) {
        throw new Error("Failed to generate any recipes or fetch corresponding videos.");
    }

    return { recipes: recipesWithVideos };
  }
);
