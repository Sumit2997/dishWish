'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating Indian recipes based on a vegetable input (image or name).
 *
 * - generateRecipes - A function that takes a vegetable name or image and returns 5 Indian recipes with estimated cooking time, protein content, YouTube video links, an image prompt, and a generated image data URI.
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
    thumbnailUrl: z.string().optional(), // Add thumbnail URL
  })).min(1).describe('A list of at least one relevant YouTube video with title, URL, and thumbnail.'), // Ensure at least one video
  imagePrompt: z.string().describe('A short, descriptive prompt suitable for generating an image of the finished dish (e.g., "A bowl of steaming Palak Paneer with naan bread").'),
  imageDataUri: z.string().optional().describe('A base64 encoded data URI of the generated recipe image.'),
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
    description: 'Find relevant YouTube cooking videos for a given recipe name, including thumbnails.',
    inputSchema: z.object({ query: z.string().describe('The recipe name to search for on YouTube.') }),
    outputSchema: z.array(z.object({
        title: z.string(),
        url: z.string(),
        thumbnailUrl: z.string().optional(), // Include thumbnail in output schema
     })).describe('List of YouTube videos with titles, URLs, and thumbnails'),
  },
  async ({ query }) => {
    // Use the existing service function (assuming it's updated for thumbnails)
    return getYouTubeVideos(query);
  }
);

// Define the prompt for recipe generation (excluding image generation step)
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
    // Schema for the LLM response *before* image generation and video fetching
    schema: z.object({
      recipes: z.array(
         RecipeSchema.omit({ youtubeVideos: true, imageDataUri: true }) // Exclude fields handled later
      ).describe('An array of 5 Indian recipes details (excluding videos and image).'),
    }),
  },
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

      Format the response as a JSON object conforming to the specified output schema (excluding youtubeVideos and imageDataUri, as those are handled separately).

      Make sure each recipe includes an estimatedCookingTime, proteinContent, and an imagePrompt.
      The output should be a valid JSON array of recipes.
  `,
});


// Define the main flow
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
    // 1. Generate recipe details and trigger YouTube search via tool
    const llmResponse = await recipePrompt(input);
    const generatedRecipesDetails = llmResponse.output?.recipes || [];

    if (generatedRecipesDetails.length === 0) {
        throw new Error("AI failed to generate initial recipe details.");
    }

    // 2. Process recipes concurrently: fetch videos and generate images
    const processedRecipesPromises = generatedRecipesDetails.map(async (recipeDetail) => {
        let youtubeVideos: YouTubeVideo[] = [];
        let imageDataUri: string | undefined = undefined;

        // a) Extract YouTube videos from tool response history
        for (const req of llmResponse.history ?? []) {
            if (req.role === 'model' && req.content) {
                for (const part of req.content) {
                    if (part.toolRequest && part.toolRequest.name === 'findYoutubeVideos' && part.toolRequest.input?.query === recipeDetail.name) {
                        const toolResponsePart = llmResponse.history?.find(
                            (resp) => resp.role === 'tool' && resp.content.some(
                                (p) => p.toolResponse && p.toolResponse.ref === part.toolRequest?.ref
                            )
                        )?.content.find((p) => p.toolResponse && p.toolResponse.ref === part.toolRequest?.ref)?.toolResponse;

                        if (toolResponsePart?.output) {
                            youtubeVideos = toolResponsePart.output as YouTubeVideo[];
                            break;
                        }
                    }
                }
            }
            if (youtubeVideos.length > 0) break;
        }

        // b) Fallback video fetch if tool failed
        if (youtubeVideos.length === 0) {
           console.warn(`YouTube tool did not return videos for recipe: ${recipeDetail.name}. Fetching manually.`);
           youtubeVideos = await getYouTubeVideos(recipeDetail.name);
        }

        // c) Ensure at least one video exists, otherwise add a placeholder search link
        if (youtubeVideos.length === 0) {
          youtubeVideos = [{
              title: `Learn more about ${recipeDetail.name}`,
              url: `https://www.youtube.com/results?search_query=${encodeURIComponent(recipeDetail.name + ' recipe')}`,
              thumbnailUrl: `https://picsum.photos/seed/${encodeURIComponent(recipeDetail.name)}/320/180`, // Placeholder thumbnail
            }];
        } else {
            // Add placeholder thumbnails if missing
            youtubeVideos = youtubeVideos.map(video => ({
                ...video,
                thumbnailUrl: video.thumbnailUrl || `https://picsum.photos/seed/${encodeURIComponent(video.title)}/320/180`
            }));
        }

        // d) Generate image using the imagePrompt
        try {
            console.log(`Generating image for: ${recipeDetail.name} with prompt: "${recipeDetail.imagePrompt}"`);
             const {media} = await ai.generate({
                // IMPORTANT: ONLY use gemini-1.5-flash or equivalent models that support image generation.
                 model: 'googleai/gemini-1.5-flash-latest', // Updated model
                 prompt: recipeDetail.imagePrompt,
                 config: {
                    // Note: As of Genkit 1.x, responseModalities seems less common.
                    // The model capability dictates output. If issues arise, refer to specific model docs.
                 },
                 output: {
                    format: 'media' // Request media output
                 }
             });
             // Ensure media and url exist and are strings
             if (media?.url && typeof media.url === 'string') {
               imageDataUri = media.url;
               console.log(`Successfully generated image for: ${recipeDetail.name}`);
             } else {
                console.warn(`Image generation did not return a valid URL for: ${recipeDetail.name}`);
             }
         } catch (imgError) {
            console.error(`Failed to generate image for recipe: ${recipeDetail.name}`, imgError);
            // Don't fail the whole process, just leave imageDataUri undefined
         }

        // e) Combine details, videos, and image URI
        return {
          ...recipeDetail,
          youtubeVideos: youtubeVideos.slice(0, 3), // Limit videos shown
          imageDataUri: imageDataUri,
        };
    });

    // 3. Await all processing
    let recipesWithVideosAndImages = await Promise.all(processedRecipesPromises);

    // 4. Ensure we always return exactly 5 recipes (if possible)
     while (recipesWithVideosAndImages.length < 5 && recipesWithVideosAndImages.length > 0) {
        console.warn('AI generated fewer than 5 recipes initially. Duplicating last recipe to meet count.');
        // Create a deep copy to avoid modifying the original object in the array
        const lastRecipeCopy = JSON.parse(JSON.stringify(recipesWithVideosAndImages[recipesWithVideosAndImages.length - 1]));
        recipesWithVideosAndImages.push(lastRecipeCopy);
     }

    if (recipesWithVideosAndImages.length === 0) {
        throw new Error("Failed to generate any recipes or fetch corresponding videos/images.");
    }

    // 5. Return the final array of recipes
    return { recipes: recipesWithVideosAndImages.slice(0, 5) }; // Ensure max 5 recipes
  }
);
