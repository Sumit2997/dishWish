// src/ai/flows/generate-recipes.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating Indian recipes based on a vegetable input (image or name).
 *
 * - generateRecipes - A function that takes a vegetable name or image and returns 5 Indian recipes with estimated cooking time, protein content, YouTube video links, an image prompt.
 * - GenerateRecipesInput - The input type for the generateRecipes function.
 * - GenerateRecipesOutput - The return type for the generateRecipes function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {getYouTubeVideos, YouTubeVideo} from '@/services/youtube';

const GenerateRecipesInputSchema = z.object({
  vegetableName: z.string().optional().describe('The name of the vegetable or a description of the desired dish.'),
  vegetableImage: z
    .string()
    .optional()
    .describe(
      "A photo of a vegetable or ingredients, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
   tags: z.array(z.string()).optional().describe('Optional tags like "quick", "vegetarian", "air-fryer" to refine the recipe generation.'),
});
export type GenerateRecipesInput = z.infer<typeof GenerateRecipesInputSchema>;

const RecipeSchema = z.object({
  name: z.string().describe('The specific name of the Indian recipe (e.g., "Palak Paneer", "Aloo Gobi").'),
  description: z.string().describe('A short (1-2 sentence) appealing description of the recipe, suitable for a selection list (e.g., "Creamy spinach curry with soft paneer cubes, a North Indian classic.", "A comforting stir-fry of potatoes and cauliflower with aromatic spices.").'),
  ingredients: z.string().describe('A list of ingredients required for the recipe, formatted with newlines or bullet points (e.g., "Spinach - 1 bunch\\nPaneer - 200g\\nOnion - 1 medium").'),
  instructions: z.string().describe('Step-by-step instructions for preparing the recipe, formatted as a numbered list (e.g., "1. Blanch spinach...\\n2. Sauté onions...").'),
  estimatedCookingTime: z.string().describe('The estimated cooking time for the recipe (e.g., "45 minutes", "1 hour").'),
  proteinContent: z.string().describe('The estimated protein content per serving, including the unit (e.g., "18g Protein", "Approx. 15g Protein").'),
  youtubeVideos: z.array(z.object({
    title: z.string(),
    url: z.string(),
    thumbnailUrl: z.string().optional(), // Add thumbnail URL
  })).min(1).describe('A list of at least one relevant YouTube video with title, URL, and thumbnail.'), // Ensure at least one video
  imagePrompt: z.string().describe('A detailed, visually descriptive prompt suitable for generating an accurate and appealing image of the finished dish, including presentation style, key ingredients visible, background, and overall atmosphere. Example: "A beautifully plated bowl of creamy Palak Paneer curry, garnished with fresh cream swirls and cilantro, served steaming hot with fluffy naan bread on the side in a rustic Indian restaurant setting, warm lighting."'),
  imageDataUri: z.string().optional().describe('A base64 encoded data URI of the generated recipe image.'),
});

const GenerateRecipesOutputSchema = z.object({
  recipes: z.array(RecipeSchema).describe('An array of 5 distinct Indian recipes.'),
});
export type GenerateRecipesOutput = z.infer<typeof GenerateRecipesOutputSchema>;

export async function generateRecipes(input: GenerateRecipesInput): Promise<GenerateRecipesOutput> {
  return generateRecipesFlow(input);
}

// Define the tool for YouTube video search
// const findYoutubeVideosTool = ai.defineTool(
//   {
//     name: 'findYoutubeVideos',
//     description: 'Find relevant YouTube cooking videos for a given Indian recipe name, including thumbnails.',
//     inputSchema: z.object({ query: z.string().describe('The Indian recipe name to search for on YouTube.') }),
//     outputSchema: z.array(z.object({
//         title: z.string(),
//         url: z.string(),
//         thumbnailUrl: z.string().optional(), // Include thumbnail in output schema
//      })).describe('List of YouTube videos with titles, URLs, and thumbnails'),
//   },
//   async ({ query }) => {
//     // Use the existing service function
//     // Fetch actual videos using the service
//     const videos = await getYouTubeVideos(query, 3); // Fetch up to 3 videos
//     console.log(`YouTube tool fetched ${videos.length} videos for: ${query}`);
//     return videos;
//   }
// );
const findYoutubeVideosTool = ai.defineTool(
  {
    name: 'findYoutubeVideos',
    description: 'Find relevant YouTube cooking videos for a given Indian recipe name, including thumbnails.',
    inputSchema: z.object({
      query: z.string().describe('The Indian recipe name to search for on YouTube.'),
    }),
    outputSchema: z.array(z.object({
      title: z.string(),
      url: z.string(),
      thumbnailUrl: z.string().optional(), // Include thumbnail in output schema
    })).describe('List of YouTube videos with titles, URLs, and thumbnails'),
  },
  async ({ query }) => {
    const apiKey = 'AIzaSyBM6uh0tuf2WleEAkRITcEj1lSMq81h_Ws';
    const encodedQuery = encodeURIComponent(`Recipe for '${query}'`);
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=3&q=${encodedQuery}&key=${apiKey}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    const videos = data.items.map((item) => {
      const videoId = item.id.videoId;
      return {
        title: item.snippet.title,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      };
    });

    console.log(`YouTube tool fetched ${videos.length} videos for: ${query}`);
    return videos;
  }
);

// Define the prompt for recipe generation (excluding image generation step)
const recipePrompt = ai.definePrompt({
  name: 'recipePrompt',
  input: {
    schema: GenerateRecipesInputSchema, // Use the main input schema
  },
  output: {
    // Schema for the LLM response *before* image generation and video fetching
    schema: z.object({
      recipes: z.array(
         // Updated RecipeSchema definition for the prompt's output
         z.object({
           name: z.string().describe('The specific name of the Indian recipe (e.g., "Palak Paneer", "Aloo Gobi").'),
           description: z.string().describe('A short (1-2 sentence) appealing description of the recipe, suitable for a selection list (e.g., "Creamy spinach curry with soft paneer cubes, a North Indian classic.", "A comforting stir-fry of potatoes and cauliflower with aromatic spices.").'),
           ingredients: z.string().describe('A list of ingredients required for the recipe, formatted with newlines or bullet points (e.g., "Spinach - 1 bunch\\nPaneer - 200g\\nOnion - 1 medium").'),
           instructions: z.string().describe('Step-by-step instructions for preparing the recipe, formatted as a numbered list (e.g., "1. Blanch spinach...\\n2. Sauté onions...").'),
           estimatedCookingTime: z.string().describe('The estimated cooking time for the recipe (e.g., "45 minutes", "1 hour").'),
           proteinContent: z.string().describe("Provide the estimated protein content per serving in various forms such as fat, oil, and other protein-related terms. Include quantities with appropriate units (e.g., 'Fat: 2g', 'Oil: 3334mg', 'Whey Protein: 15g')."),
           // Enhanced description for imagePrompt generation
           imagePrompt: z.string().describe('A detailed, visually descriptive prompt suitable for generating an accurate and appealing image of the finished dish, including presentation style, key ingredients visible, background, and overall atmosphere. Example: "A beautifully plated bowl of creamy Palak Paneer curry, garnished with fresh cream swirls and cilantro, served steaming hot with fluffy naan bread on the side in a rustic Indian restaurant setting, warm lighting." Ensure the prompt clearly describes the specific dish and its context.'),
         })
         // youtubeVideos and imageDataUri are omitted as they are handled later
      ).describe('An array of 5 distinct Indian recipes details (including specific name, short description, ingredients, instructions, cooking time, protein content, and detailed image prompt).'),
    }),
  },
  tools: [findYoutubeVideosTool],
  prompt: `You are an expert Indian chef specializing in diverse regional cuisines. Generate 5 distinct Indian recipes based on the provided input. Ensure variety in cuisine style, cooking method, or primary ingredients if possible.

      Consider the following input:
      {{#if vegetableName}}
      - Description/Request: {{{vegetableName}}}
      {{/if}}
      {{#if vegetableImage}}
      - Image Analysis: Base your recipe suggestions on the ingredients visible in this image: {{media url=vegetableImage}}
      {{/if}}
      {{#if tags}}
      - Tags/Preferences: {{#each tags}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}} (Consider these tags like quick, vegetarian, spicy, regional preferences etc.)
      {{/if}}

      For **each** of the 5 recipes, you **must** provide:
      - name: The **specific, authentic name** of the Indian recipe (e.g., "Dal Makhani", "Vegetable Korma", "Masala Dosa").
      - description: A **short (1-2 sentence) appealing description** of the dish, perfect for a quick preview in a list. Highlight key features, flavors, or origin (e.g., "A rich and creamy black lentil curry slow-cooked with butter and spices.", "Mixed vegetables simmered in a fragrant coconut and cashew gravy.").
      - ingredients: A list of ingredients, formatted clearly using newlines or bullet points. Include quantities where appropriate (e.g., "Urad Dal - 1 cup", "Ginger-garlic paste - 1 tbsp").
      - instructions: Step-by-step instructions, formatted as a numbered list (e.g., "1. Soak dal overnight...", "2. Pressure cook until soft...").
      - estimatedCookingTime: The estimated total cooking time (e.g., "1 hour 30 minutes", "40 minutes").
      - proteinContent: The estimated protein content per serving, including the unit (e.g., "22g Protein", "Approx. 10g Protein").
      - imagePrompt: A **highly detailed and visually descriptive prompt** for generating an accurate and appealing image of the finished dish. Describe the plating (bowl type, arrangement), visible ingredients (texture, color), garnish (herbs, cream swirls), background (table setting, kitchen counter, ambient light), and overall visual appeal specific to *this* recipe. Aim for photorealism. Example for Dal Makhani: "Photorealistic close-up of rich, dark brown Dal Makhani in a traditional copper handi, glistening with butter, garnished with a swirl of fresh cream and chopped cilantro, steam gently rising, placed on a rustic wooden table next to a piece of charred naan bread, warm ambient lighting."

      **Crucially, for each generated recipe, you MUST use the 'findYoutubeVideos' tool to find at least one relevant YouTube cooking video.** Use the specific recipe name as the query.

      Format the response as a JSON object conforming to the specified output schema (containing the 'recipes' array with name, description, ingredients, instructions, estimatedCookingTime, proteinContent, and imagePrompt).

      Ensure each recipe has all required fields, especially the **specific name**, **short description**, and **detailed imagePrompt**.
      Generate exactly 5 diverse recipes if possible based on the input. Prioritize recipes directly related to the input ingredients or description.
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
        const fallbackPlaceholderImage = `https://picsum.photos/seed/${encodeURIComponent(recipeDetail.name)}/400/300`;

        // a) Extract YouTube videos from tool response history
        try {
            // Find the tool request triggered by the LLM for *this specific recipe name*
            const toolRequestPart = llmResponse.history?.find(req =>
                req.role === 'model' && req.content.some(part =>
                    part.toolRequest?.name === 'findYoutubeVideos' && part.toolRequest.input?.query === recipeDetail.name
                )
            )?.content.find(part => part.toolRequest?.name === 'findYoutubeVideos');

            // Find the corresponding tool response using the 'ref'
            if (toolRequestPart?.toolRequest?.ref) {
                const toolResponsePart = llmResponse.history?.find(resp =>
                    resp.role === 'tool' && resp.content.some(p => p.toolResponse?.ref === toolRequestPart.toolRequest?.ref)
                )?.content.find(p => p.toolResponse?.ref === toolRequestPart.toolRequest?.ref)?.toolResponse;

                if (toolResponsePart?.output) {
                     try {
                       // Validate and parse the output using the tool's output schema
                       const parsedVideos = z.array(z.object({
                           title: z.string(),
                           url: z.string(),
                           thumbnailUrl: z.string().optional(),
                       })).parse(toolResponsePart.output);
                       youtubeVideos = parsedVideos;
                       console.log(`Successfully parsed YouTube videos from tool for: ${recipeDetail.name}`);
                     } catch (parseError) {
                       console.error(`Error parsing YouTube tool response for ${recipeDetail.name}:`, parseError);
                       // Fallback will be triggered below if parsing fails
                     }
                 } else {
                     console.warn(`Tool response part not found or empty for ${recipeDetail.name}. Ref: ${toolRequestPart.toolRequest.ref}`);
                 }
            } else {
                 console.warn(`Tool request part not found for ${recipeDetail.name}. The LLM might not have triggered the tool correctly.`);
            }
        } catch (toolError) {
             console.error(`Error processing YouTube tool response for ${recipeDetail.name}:`, toolError);
        }

        // b) Fallback video fetch if tool failed or didn't return valid results
        if (youtubeVideos.length === 0) {
           console.warn(`YouTube tool did not return valid videos for recipe: ${recipeDetail.name}. Fetching manually.`);
           // Call the service directly if the tool failed
           try {
                youtubeVideos = await getYouTubeVideos(recipeDetail.name, 3); // Fetch up to 3 videos
                console.log(`Manual YouTube fetch returned ${youtubeVideos.length} videos for: ${recipeDetail.name}`);
           } catch (fetchError) {
                console.error(`Manual YouTube fetch failed for ${recipeDetail.name}:`, fetchError);
           }
        }

         // c) Ensure at least one video exists (add placeholder search link if none found) and ensure thumbnails
          if (youtubeVideos.length === 0) {
            youtubeVideos = [{
                title: `Search YouTube for ${recipeDetail.name}`,
                url: `https://www.youtube.com/results?search_query=${encodeURIComponent(recipeDetail.name + ' recipe')}`,
                thumbnailUrl: `https://picsum.photos/seed/${encodeURIComponent(recipeDetail.name)}/320/180`, // Placeholder thumbnail
              }];
          } else {
              // Ensure all videos have a thumbnail (use placeholder if needed)
              youtubeVideos = youtubeVideos.map(video => ({
                  ...video,
                  thumbnailUrl: video.thumbnailUrl || `https://picsum.photos/seed/${encodeURIComponent(video.title)}/320/180`
              }));
          }

         // d) Generate image using the enhanced imagePrompt and the correct model
         try {
             console.log(`Generating image for: ${recipeDetail.name} with prompt: "${recipeDetail.imagePrompt}"`);
             // Use the correct experimental model for image generation
              const { media } = await ai.generate({
                  model: 'googleai/gemini-2.0-flash-exp', // Correct model for images
                  prompt: recipeDetail.imagePrompt,
                  config: {
                    responseModalities: ['IMAGE'], // Request only IMAGE modality if text isn't needed
                  },
                  output: {
                    format: 'media', // Request media output
                  },
              });
              // Ensure media and url exist and are strings
              if (media?.url && typeof media.url === 'string') {
                imageDataUri = media.url;
                console.log(`Successfully generated image for: ${recipeDetail.name}`);
              } else {
                 console.warn(`Image generation did not return a valid media URL for: ${recipeDetail.name}. Response:`, media);
                 imageDataUri = fallbackPlaceholderImage; // Fallback placeholder
              }
          } catch (imgError) {
             console.error(`Failed to generate image for recipe: ${recipeDetail.name}. Error: ${imgError instanceof Error ? imgError.message : String(imgError)}`);
             imageDataUri = fallbackPlaceholderImage; // Fallback placeholder
          }


        // e) Combine details, videos, and image URI
        return {
          ...recipeDetail,
          youtubeVideos: youtubeVideos.slice(0, 3), // Limit videos shown to 3
          imageDataUri: imageDataUri,
        };
    });

    // 3. Await all processing
    let recipesWithVideosAndImages = await Promise.all(processedRecipesPromises);

    // 4. Validate the final recipe structure (optional but good practice)
    recipesWithVideosAndImages = recipesWithVideosAndImages.filter(recipe => {
       try {
           RecipeSchema.parse(recipe); // Check if it conforms to the final schema
           return true;
       } catch (validationError) {
           console.error(`Recipe "${recipe.name}" failed final validation:`, validationError);
           return false; // Exclude invalid recipes
       }
    });

    if (recipesWithVideosAndImages.length === 0) {
        throw new Error("Failed to generate any valid recipes with videos and images.");
    }

    // 5. Return the final array of valid recipes (up to 5)
    return { recipes: recipesWithVideosAndImages.slice(0, 5) }; // Ensure max 5 recipes
  }
);
