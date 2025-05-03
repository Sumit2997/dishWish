// src/ai/flows/generate-recipes.ts
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
  name: z.string().describe('The name of the recipe.'),
  description: z.string().describe('A short (1-2 sentence) appealing description of the recipe, suitable for a selection list.'), // Added description field
  ingredients: z.string().describe('A list of ingredients required for the recipe, formatted with newlines or bullet points.'),
  instructions: z.string().describe('Step-by-step instructions for preparing the recipe, formatted as a numbered list.'),
  estimatedCookingTime: z.string().describe('The estimated cooking time for the recipe (e.g., 30 minutes).'),
  proteinContent: z.string().describe('The estimated protein content per serving (e.g., 15g Protein). Include the unit.'),
  youtubeVideos: z.array(z.object({
    title: z.string(),
    url: z.string(),
    thumbnailUrl: z.string().optional(), // Add thumbnail URL
  })).min(1).describe('A list of at least one relevant YouTube video with title, URL, and thumbnail.'), // Ensure at least one video
  imagePrompt: z.string().describe('A detailed, visually descriptive prompt suitable for generating an image of the finished dish, including presentation style, key ingredients visible, and overall appearance (e.g., "A beautifully plated bowl of creamy Palak Paneer curry, garnished with fresh cream swirls and cilantro, served steaming hot with fluffy naan bread on the side, warm lighting.").'),
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
    schema: GenerateRecipesInputSchema, // Use the main input schema
  },
  output: {
    // Schema for the LLM response *before* image generation and video fetching
    schema: z.object({
      recipes: z.array(
         // Updated RecipeSchema definition for the prompt's output
         z.object({
           name: z.string().describe('The name of the recipe.'),
           description: z.string().describe('A short (1-2 sentence) appealing description of the recipe, suitable for a selection list (e.g., "A savory breakfast dish featuring diced potatoes pan-fried with onions and spices for a crispy, comforting start to your day.").'), // Added description field to prompt output
           ingredients: z.string().describe('A list of ingredients required for the recipe, formatted with newlines or bullet points.'),
           instructions: z.string().describe('Step-by-step instructions for preparing the recipe, formatted as a numbered list.'),
           estimatedCookingTime: z.string().describe('The estimated cooking time for the recipe (e.g., 30 minutes).'),
           proteinContent: z.string().describe('The estimated protein content per serving (e.g., 15g Protein). Include the unit.'),
           // Enhanced description for imagePrompt generation
           imagePrompt: z.string().describe('A detailed, visually descriptive prompt suitable for generating an image of the finished dish, including presentation style, key ingredients visible, and overall appearance (e.g., "A beautifully plated bowl of creamy Palak Paneer curry, garnished with fresh cream swirls and cilantro, served steaming hot with fluffy naan bread on the side, warm lighting."). Ensure the prompt clearly describes the specific dish.'),
         })
         // youtubeVideos and imageDataUri are omitted as they are handled later
      ).describe('An array of 5 Indian recipes details (including short description, excluding videos and image).'),
    }),
  },
  tools: [findYoutubeVideosTool],
  prompt: `You are an expert Indian chef. Generate 5 distinct Indian recipes based on the provided input.

      Consider the following input:
      {{#if vegetableName}}
      - Description/Request: {{{vegetableName}}}
      {{/if}}
      {{#if vegetableImage}}
      - Image: {{media url=vegetableImage}}
      {{/if}}
      {{#if tags}}
      - Tags/Preferences: {{#each tags}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
      {{/if}}

      For each recipe, you **must** provide:
      - name: The specific name of the recipe.
      - description: A **short (1-2 sentence) appealing description** of the dish, perfect for a quick preview in a list. Highlight key features or flavors.
      - ingredients: A list of ingredients, formatted clearly (e.g., using newlines or bullet points).
      - instructions: Step-by-step instructions, formatted as a numbered list (e.g., "1. Chop onions...").
      - estimatedCookingTime: The estimated cooking time (e.g., "45 minutes").
      - proteinContent: The estimated protein content per serving, including the unit (e.g., "20g Protein").
      - imagePrompt: A **highly detailed and visually descriptive prompt** for generating an accurate image of the finished dish. Describe the plating, visible ingredients, texture, garnish, and overall visual appeal specific to *this* recipe. Example: "Close-up photo of steaming hot Aloo Gobi in a traditional steel bowl, showing tender potatoes and cauliflower florets coated in a rich yellow turmeric-spiced masala, garnished with fresh coriander leaves, slightly shallow depth of field."

      **Crucially, for each generated recipe, you MUST use the 'findYoutubeVideos' tool to find at least one relevant YouTube cooking video.** Use the recipe name as the query.

      Format the response as a JSON object conforming to the specified output schema (containing the 'recipes' array with name, description, ingredients, instructions, estimatedCookingTime, proteinContent, and imagePrompt).

      Ensure each recipe has all required fields, especially the **short description** and **detailed imagePrompt**.
      Generate exactly 5 diverse recipes if possible based on the input.
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
        // Try to find the tool request/response associated with this specific recipe name
        const toolRequestRef = llmResponse.history?.find(req =>
            req.role === 'model' && req.content.some(part =>
                part.toolRequest?.name === 'findYoutubeVideos' && part.toolRequest.input?.query === recipeDetail.name
            )
        )?.content.find(part => part.toolRequest?.name === 'findYoutubeVideos')?.toolRequest?.ref;

        if (toolRequestRef) {
            const toolResponsePart = llmResponse.history?.find(resp =>
                resp.role === 'tool' && resp.content.some(p => p.toolResponse?.ref === toolRequestRef)
            )?.content.find(p => p.toolResponse?.ref === toolRequestRef)?.toolResponse;

            if (toolResponsePart?.output) {
                try {
                   // Validate and parse the output
                   const parsedVideos = z.array(z.object({
                       title: z.string(),
                       url: z.string(),
                       thumbnailUrl: z.string().optional(),
                   })).parse(toolResponsePart.output);
                   youtubeVideos = parsedVideos;
                 } catch (parseError) {
                   console.error(`Error parsing YouTube tool response for ${recipeDetail.name}:`, parseError);
                   // Continue without videos from tool if parsing fails
                 }
            }
        }


        // b) Fallback video fetch if tool failed or didn't return valid results
        if (youtubeVideos.length === 0) {
           console.warn(`YouTube tool did not return valid videos for recipe: ${recipeDetail.name}. Fetching manually.`);
           youtubeVideos = await getYouTubeVideos(recipeDetail.name); // Use actual API call here
        }

         // c) Ensure at least one video exists, otherwise add a placeholder search link
          if (youtubeVideos.length === 0) {
            youtubeVideos = [{
                title: `Search YouTube for ${recipeDetail.name}`,
                url: `https://www.youtube.com/results?search_query=${encodeURIComponent(recipeDetail.name + ' recipe')}`,
                thumbnailUrl: `https://picsum.photos/seed/${encodeURIComponent(recipeDetail.name)}/320/180`, // Placeholder thumbnail
              }];
          } else {
              // Add placeholder thumbnails if missing from actual API response (shouldn't happen with real API)
              youtubeVideos = youtubeVideos.map(video => ({
                  ...video,
                  thumbnailUrl: video.thumbnailUrl || `https://picsum.photos/seed/${encodeURIComponent(video.title)}/320/180`
              }));
          }

         // d) Generate image using the enhanced imagePrompt and the correct model
         try {
             console.log(`Generating image for: ${recipeDetail.name} with prompt: "${recipeDetail.imagePrompt}"`);
              const { media } = await ai.generate({
                  // IMPORTANT: Using gemini-2.0-flash-exp for image generation
                  model: 'googleai/gemini-2.0-flash-exp', // USE THIS MODEL for images
                  prompt: recipeDetail.imagePrompt, // Use the detailed prompt
                  // MUST provide config for gemini-2.0-flash-exp
                  config: {
                    responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE
                  },
                  output: {
                    format: 'media', // Request media output - this might be redundant with config above but keep for clarity
                  },
              });
              // Ensure media and url exist and are strings
              if (media?.url && typeof media.url === 'string') {
                imageDataUri = media.url;
                console.log(`Successfully generated image for: ${recipeDetail.name}`);
              } else {
                 console.warn(`Image generation did not return a valid URL for: ${recipeDetail.name}. Model response might be incomplete.`);
                 imageDataUri = `https://picsum.photos/seed/${encodeURIComponent(recipeDetail.name)}/400/300`; // Fallback placeholder
              }
          } catch (imgError) {
             console.error(`Failed to generate image for recipe: ${recipeDetail.name}. Error: ${imgError instanceof Error ? imgError.message : String(imgError)}`);
             // Don't fail the whole process, just use a placeholder
             imageDataUri = `https://picsum.photos/seed/${encodeURIComponent(recipeDetail.name)}/400/300`; // Fallback placeholder
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

    // 4. Ensure we always return exactly 5 recipes (if possible, otherwise fewer)
    // This duplication logic might be undesirable if the AI truly can't find 5 diverse recipes.
    // Consider if just returning the available < 5 recipes is better.
    // while (recipesWithVideosAndImages.length < 5 && recipesWithVideosAndImages.length > 0) {
    //    console.warn('AI generated fewer than 5 recipes initially. Duplicating last recipe to meet count.');
    //    // Create a deep copy to avoid modifying the original object in the array
    //    const lastRecipeCopy = JSON.parse(JSON.stringify(recipesWithVideosAndImages[recipesWithVideosAndImages.length - 1]));
    //    recipesWithVideosAndImages.push(lastRecipeCopy);
    // }

    if (recipesWithVideosAndImages.length === 0) {
        throw new Error("Failed to generate any recipes or fetch corresponding videos/images.");
    }

    // 5. Return the final array of recipes (up to 5)
    return { recipes: recipesWithVideosAndImages.slice(0, 5) }; // Ensure max 5 recipes
  }
);

```
  </change>
  <change>
    <file>src/components/recipe/recipe-card.tsx</file>
    <description>Add the Image component back to RecipeCard to display the generated recipe image.</description>
    <content><![CDATA[// src/components/recipe/recipe-card.tsx
import type { FC } from 'react';
import type { GenerateRecipesOutput } from '@/ai/flows/generate-recipes';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Clock, Scale, Youtube } from 'lucide-react'; // Use Scale icon for protein
import Link from 'next/link';
import Image from 'next/image';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// Use the Recipe type directly from the flow definition if possible
type Recipe = GenerateRecipesOutput['recipes'][0];

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: FC<RecipeCardProps> = ({ recipe }) => {
  // Helper function to safely split and format text into bullet points or numbered list
  const formatList = (text: string | undefined, listType: 'ul' | 'ol' = 'ul') => {
    if (!text) return <p className="text-sm text-muted-foreground italic">Not available.</p>;
    // Improved splitting: Handles different newline characters and trims extra whitespace/bullets/numbers
    const items = text.split(/[\n•*-]|\d+\.\s/)
                      .map(item => item.trim())
                      .filter(Boolean); // Remove empty strings

    if (items.length === 0) return <p className="text-sm text-muted-foreground italic">Not available.</p>;

    const ListTag = listType;
    return (
      <ListTag className={`pl-5 space-y-1.5 text-muted-foreground ${listType === 'ol' ? 'list-decimal' : 'list-disc'}`}>
        {items.map((item, index) => (
          <li key={index} className="text-sm leading-relaxed">{item}</li>
        ))}
      </ListTag>
    );
  };

  // Fallback image using picsum with recipe name as seed
  const fallbackImageUrl = `https://picsum.photos/seed/${encodeURIComponent(recipe.name)}/400/300`;
  // Use generated image if available, otherwise fallback
  const imageUrl = recipe.imageDataUri || fallbackImageUrl;
  // Check if the URL is a data URI (for optimization purposes)
  const isDataUri = imageUrl.startsWith('data:');

  // Generate a unique identifier for the recipe (using URL-encoded name for now)
  // TODO: Replace with a proper unique ID if available
  const recipeId = encodeURIComponent(recipe.name);


  return (
    <Link href={`/app/recipe/${recipeId}`} passHref legacyBehavior>
        <a className="block group"> {/* Use anchor tag for Next.js Link */}
            <Card className="w-full h-full rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden bg-card border border-border/50 group-hover:border-primary/50">
                {/* Image component added back */}
                <div className="relative w-full aspect-[4/3]">
                    <Image
                        src={imageUrl}
                        alt={`Image of ${recipe.name}`}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 group-hover:scale-105"
                        unoptimized={isDataUri} // Important for data URIs
                        data-ai-hint={recipe.imagePrompt || recipe.name} // Add hint for AI
                        onError={(e) => {
                            // Fallback to picsum if the generated image fails to load
                            if (e.currentTarget.src !== fallbackImageUrl) {
                                console.warn(`Failed to load image for ${recipe.name}, falling back to placeholder.`);
                                e.currentTarget.src = fallbackImageUrl;
                                e.currentTarget.srcset = ""; // Clear srcset if using fallback
                            }
                        }}
                    />
                </div>


                <CardHeader className="pb-3 pt-6 px-5"> {/* Adjusted padding */}
                    <CardTitle className="text-xl font-semibold text-primary leading-snug group-hover:text-primary/90 transition-colors">
                        {recipe.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground pt-1 line-clamp-2">
                       {recipe.description || 'Delicious recipe awaits...'}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-2.5"> {/* Adjusted spacing */}
                        <Badge variant="secondary" className="flex items-center gap-1.5 py-1 px-2.5 rounded-md bg-secondary/80 text-secondary-foreground text-xs font-medium border-none"> {/* Nicer badge */}
                        <Clock className="h-3.5 w-3.5" />
                        {recipe.estimatedCookingTime || 'N/A'}
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1.5 py-1 px-2.5 rounded-md bg-secondary/80 text-secondary-foreground text-xs font-medium border-none"> {/* Nicer badge */}
                        <Scale className="h-3.5 w-3.5" />
                        {recipe.proteinContent || 'Protein N/A'} {/* Directly use string */}
                        </Badge>
                    </div>
                </CardHeader>

                 {/* Content and Footer are optional for card view, detail page will show full info */}
                 <CardContent className="px-5 py-3 flex-1">
                    {/* Maybe show a snippet or nothing here, full details on click */}
                    <p className="text-xs text-muted-foreground italic">Click to view full recipe...</p>
                </CardContent>


                {/* Optional Footer - can be removed if not needed in card view */}
                <CardFooter className="flex flex-col items-start gap-3 px-5 pt-4 pb-5 bg-muted/30 border-t border-border/30">
                    <h4 className="text-sm font-medium text-foreground mb-0">Suggested Videos</h4>
                    {(recipe.youtubeVideos && recipe.youtubeVideos.length > 0) ? (
                    <ScrollArea className="w-full whitespace-nowrap rounded-md -ml-1">
                        <div className="flex w-max space-x-3 p-1">
                        {recipe.youtubeVideos.slice(0, 3).map((video, index) => ( // Only show first 3 videos
                            <Link key={index} href={video.url} target="_blank" rel="noopener noreferrer">
                                <div
                                className="group relative flex-shrink-0 w-40 overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-border/30 bg-card"
                                >
                                <div className="relative h-24 w-full bg-muted"> {/* Background for thumbnail */}
                                    <Image
                                    src={video.thumbnailUrl || `https://picsum.photos/seed/${encodeURIComponent(video.title)}/320/180`}
                                    alt={`Thumbnail for ${video.title}`}
                                    layout="fill"
                                    objectFit="cover"
                                    className="transition-transform duration-300 group-hover:scale-105"
                                    unoptimized
                                    onError={(e) => {
                                        const fallbackThumb = `https://picsum.photos/seed/${encodeURIComponent(video.title)}/320/180`;
                                        if (e.currentTarget.src !== fallbackThumb) {
                                            e.currentTarget.src = fallbackThumb;
                                            e.currentTarget.srcset = "";
                                        }
                                    }}
                                    />
                                    {/* YouTube Play Icon Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <Youtube className="h-8 w-8 text-white/80 drop-shadow-md" />
                                    </div>
                                </div>
                                <p className="mt-1.5 px-2 pb-2 text-xs text-muted-foreground truncate leading-snug" title={video.title}>
                                    {video.title}
                                </p>
                                </div>
                            </Link>
                        ))}
                        </div>
                        <ScrollBar orientation="horizontal" className="h-2"/>
                    </ScrollArea>
                    ) : (
                    <p className="text-sm text-muted-foreground italic">No specific videos found.</p>
                    )}
                </CardFooter>

            </Card>
        </a>
    </Link>
  );
};

export default RecipeCard;

```
  </change>
  <change>
    <file>next.config.ts</file>
    <description>Allow images from lh3.googleusercontent.com in next.config.js for generated images.</description>
    <content><![CDATA[import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
       {
         // Allow images generated by Genkit/Google AI
         protocol: 'https',
         hostname: 'lh3.googleusercontent.com',
         port: '',
         pathname: '/**',
       },
       {
         // Allow YouTube thumbnails (example pattern, might need adjustment based on actual thumbnail URLs)
         protocol: 'https',
         hostname: 'i.ytimg.com',
         port: '',
         pathname: '/vi/**',
       },
       {
         // Allow Firebase Storage images (if used)
          protocol: 'https',
          hostname: 'firebasestorage.googleapis.com',
          port: '',
          pathname: '/v0/b/**',
       }
    ],
     // Allow data URIs for generated images
     dangerouslyAllowSVG: true,
     contentDispositionType: 'attachment',
     contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
     // Enable handling of data URIs
     // This might not be needed explicitly depending on Next.js version,
     // but `unoptimized={true}` on the Image component is the primary way to handle data URIs.
     // domains: ['data:'], // This syntax is often incorrect. Use remotePatterns for hosts.
  },
};

export default nextConfig;


  