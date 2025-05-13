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

// Define nutrition schema for more detailed nutritional information
const NutritionSchema = z.object({
  calories: z.string().describe('Total calories per serving e.g. "450 kcal"'),
  protein: z.string().describe('Protein content per serving e.g. "15g"'),
  fat: z.object({
    total: z.string().describe('Total fat content per serving e.g. "20g"'),
    saturated: z.string().optional().describe('Saturated fat content per serving e.g. "5g"')
  }),
  carbohydrates: z.object({
    total: z.string().describe('Total carbohydrates per serving e.g. "40g"'),
    fiber: z.string().optional().describe('Dietary fiber content per serving e.g. "8g"'),
    sugar: z.string().optional().describe('Sugar content per serving e.g. "10g"')
  }),
  sodium: z.string().optional().describe('Sodium content per serving e.g. "500mg"'),
  servingSize: z.string().optional().describe('Serving size e.g. "1 cup" or "250g"')
}).optional();

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
  id: z.string().optional().describe('A unique identifier for the recipe.'),
  nutrition: NutritionSchema.describe('Detailed nutritional information for the recipe.'),
  dishType: z.string().describe('The type of dish (e.g., "curry", "snack", "dessert", "main course").'),
  cuisine: z.string().describe('The regional cuisine style (e.g., "North Indian", "South Indian", "Mughlai").'),
});

// Create schema with a shorthand identifier for easier reference
export type Recipe = z.infer<typeof RecipeSchema>;

const GenerateRecipesOutputSchema = z.object({
  recipes: z.array(RecipeSchema).describe('An array of 5 distinct Indian recipes.'),
});
export type GenerateRecipesOutput = z.infer<typeof GenerateRecipesOutputSchema>;

export async function generateRecipes(input: GenerateRecipesInput): Promise<GenerateRecipesOutput> {
  try {
    console.log('Starting recipe generation with input:', {
      vegetableName: input.vegetableName,
      hasImage: !!input.vegetableImage,
      tags: input.tags
    });
    
    // Try using the flow first
    try {
      const result = await generateRecipesFlow(input);
      
      // Add unique IDs to recipes
      result.recipes = result.recipes.map((recipe, index) => ({
        ...recipe,
        id: `recipe-${Date.now()}-${index}`,
      }));
      
      console.log('Recipe generation successful, recipes generated:', result.recipes.length);
      return result;
    } catch (flowError) {
      console.error('Primary recipe generation flow failed:', flowError);
      
      // If the input was a description, we can try a fallback
      if (input.vegetableName) {
        console.log('Attempting fallback recipe generation with simpler prompt');
        
        // Generate fallback recipes with minimal functionality
        const fallbackRecipes = await generateFallbackRecipes(input.vegetableName, input.tags || []);
        console.log('Generated fallback recipes:', fallbackRecipes.length);
        
        return {
          recipes: fallbackRecipes
        };
      }
      
      // If no suitable fallback, rethrow the error
      throw flowError;
    }
  } catch (error) {
    console.error('Recipe generation failed with error:', error);
    throw error;
  }
}

// Fallback recipe generation function for when the main flow fails
async function generateFallbackRecipes(description: string, tags: string[]): Promise<Array<any>> {
  // Provide static fallback recipes for common ingredients
  const keyword = description.toLowerCase();
  
  // Sample recipes for common inputs
  const commonRecipes: {[key: string]: any} = {
    potato: {
      name: "Aloo Jeera",
      description: "A simple yet flavorful dish of cumin-spiced potatoes, perfect as a side dish.",
      ingredients: "Potatoes - 4 medium\nCumin seeds - 1 tsp\nTurmeric - 1/2 tsp\nRed chili powder - 1/2 tsp\nSalt - to taste\nOil - 2 tbsp\nCoriander leaves - for garnish",
      instructions: "1. Boil potatoes, peel and cube them.\n2. Heat oil in a pan, add cumin seeds.\n3. Add potatoes, turmeric, chili powder and salt.\n4. Sauté for 5-7 minutes until crispy.\n5. Garnish with coriander leaves.",
      estimatedCookingTime: "25 minutes",
      proteinContent: "2g Protein",
      youtubeVideos: [{
        title: "Easy Aloo Jeera Recipe",
        url: "https://www.youtube.com/results?search_query=aloo+jeera+recipe",
        thumbnailUrl: "https://picsum.photos/seed/aloojeera/320/180"
      }],
      imageDataUri: "https://picsum.photos/seed/aloojeera/400/300"
    },
    tomato: {
      name: "Tomato Curry",
      description: "A tangy and spicy tomato curry that pairs perfectly with rice or roti.",
      ingredients: "Tomatoes - 6 large\nOnion - 1 medium\nGinger-garlic paste - 1 tbsp\nGreen chilies - 2\nCumin seeds - 1 tsp\nTurmeric - 1/2 tsp\nGaram masala - 1 tsp\nSalt - to taste\nOil - 3 tbsp\nCoriander leaves - for garnish",
      instructions: "1. Heat oil, add cumin seeds until they splutter.\n2. Add chopped onions and sauté until golden brown.\n3. Add ginger-garlic paste and green chilies, cook for 2 minutes.\n4. Add chopped tomatoes, turmeric, salt and cook until tomatoes are soft.\n5. Add garam masala, mix well.\n6. Garnish with coriander leaves.",
      estimatedCookingTime: "30 minutes",
      proteinContent: "1.5g Protein",
      youtubeVideos: [{
        title: "Traditional Tomato Curry",
        url: "https://www.youtube.com/results?search_query=indian+tomato+curry+recipe",
        thumbnailUrl: "https://picsum.photos/seed/tomatocurry/320/180"
      }],
      imageDataUri: "https://picsum.photos/seed/tomatocurry/400/300"
    },
    spinach: {
      name: "Palak Paneer",
      description: "A classic North Indian dish with creamy spinach and soft cottage cheese cubes.",
      ingredients: "Spinach (Palak) - 500g\nPaneer - 200g\nOnion - 1 medium\nTomato - 1 medium\nGinger-garlic paste - 1 tbsp\nGreen chilies - 2\nHeavy cream - 2 tbsp\nCumin seeds - 1 tsp\nGaram masala - 1 tsp\nSalt - to taste\nGhee or Oil - 3 tbsp",
      instructions: "1. Blanch spinach in hot water for 2-3 minutes, then blend into a smooth paste.\n2. Heat oil, add cumin seeds until they splutter.\n3. Add chopped onions, sauté until golden brown.\n4. Add ginger-garlic paste, green chilies, and chopped tomatoes, cook until soft.\n5. Add spinach puree, salt, and garam masala. Cook for 5 minutes.\n6. Add paneer cubes and simmer for 5 more minutes.\n7. Finish with heavy cream and serve hot.",
      estimatedCookingTime: "45 minutes",
      proteinContent: "12g Protein",
      youtubeVideos: [{
        title: "Creamy Palak Paneer Recipe",
        url: "https://www.youtube.com/results?search_query=palak+paneer+recipe",
        thumbnailUrl: "https://picsum.photos/seed/palakpaneer/320/180"
      }],
      imageDataUri: "https://picsum.photos/seed/palakpaneer/400/300"
    },
    onion: {
      name: "Pyaz ki Sabzi",
      description: "A simple and flavorful onion curry that's quick to prepare.",
      ingredients: "Onions - 4 large\nTomatoes - 2 medium\nGinger-garlic paste - 1 tbsp\nGreen chilies - 2\nCumin seeds - 1 tsp\nTurmeric - 1/2 tsp\nRed chili powder - 1 tsp\nCoriander powder - 1 tsp\nSalt - to taste\nOil - 3 tbsp\nCoriander leaves - for garnish",
      instructions: "1. Heat oil, add cumin seeds until they splutter.\n2. Add sliced onions, sauté until translucent.\n3. Add ginger-garlic paste, green chilies, cook for 2 minutes.\n4. Add chopped tomatoes, turmeric, red chili powder, coriander powder, and salt.\n5. Cook until tomatoes are soft and oil separates.\n6. Garnish with coriander leaves.",
      estimatedCookingTime: "25 minutes",
      proteinContent: "1g Protein",
      youtubeVideos: [{
        title: "Simple Onion Sabzi",
        url: "https://www.youtube.com/results?search_query=pyaz+ki+sabzi+recipe",
        thumbnailUrl: "https://picsum.photos/seed/onionsabzi/320/180"
      }],
      imageDataUri: "https://picsum.photos/seed/onionsabzi/400/300"
    },
    vegetable: {
      name: "Mixed Vegetable Curry",
      description: "A colorful and nutritious curry with a variety of vegetables in a spiced tomato gravy.",
      ingredients: "Mixed vegetables (carrots, beans, peas, potatoes) - 3 cups\nOnion - 1 large\nTomatoes - 2 medium\nGinger-garlic paste - 1 tbsp\nGreen chilies - 2\nCumin seeds - 1 tsp\nTurmeric - 1/2 tsp\nRed chili powder - 1 tsp\nGaram masala - 1 tsp\nCoriander powder - 1 tsp\nSalt - to taste\nOil - 3 tbsp\nCoriander leaves - for garnish",
      instructions: "1. Heat oil, add cumin seeds until they splutter.\n2. Add chopped onions, sauté until golden brown.\n3. Add ginger-garlic paste, green chilies, cook for 2 minutes.\n4. Add chopped tomatoes, turmeric, red chili powder, coriander powder, and salt.\n5. Add chopped vegetables, mix well and cover with a lid.\n6. Cook until vegetables are tender, about 15 minutes.\n7. Add garam masala, mix well.\n8. Garnish with coriander leaves.",
      estimatedCookingTime: "40 minutes",
      proteinContent: "3g Protein",
      youtubeVideos: [{
        title: "Homestyle Mixed Vegetable Curry",
        url: "https://www.youtube.com/results?search_query=mixed+vegetable+curry+indian+recipe",
        thumbnailUrl: "https://picsum.photos/seed/mixvegcurry/320/180"
      }],
      imageDataUri: "https://picsum.photos/seed/mixvegcurry/400/300"
    }
  };
  
  // Try to match input with keywords
  let matchedRecipes = [];
  for (const [key, recipe] of Object.entries(commonRecipes)) {
    if (keyword.includes(key)) {
      matchedRecipes.push(recipe);
    }
  }
  
  // If no matches found, return mixed vegetable curry as default
  if (matchedRecipes.length === 0) {
    matchedRecipes = [commonRecipes.vegetable];
    
    // Add a few more generic recipes
    matchedRecipes.push({
      name: "Vegetable Pulao",
      description: "A fragrant rice dish cooked with mixed vegetables and aromatic spices.",
      ingredients: "Basmati rice - 2 cups\nMixed vegetables - 2 cups\nOnion - 1 large\nGinger-garlic paste - 1 tbsp\nBay leaf - 1\nCinnamon stick - 1 inch\nCloves - 4\nCardamom - 2 pods\nCumin seeds - 1 tsp\nTurmeric - 1/2 tsp\nSalt - to taste\nGhee or Oil - 3 tbsp\nMint leaves - for garnish",
      instructions: "1. Soak rice for 20 minutes, then drain.\n2. Heat ghee, add whole spices (bay leaf, cinnamon, cloves, cardamom).\n3. Add cumin seeds, then chopped onions and sauté until golden.\n4. Add ginger-garlic paste, cook for 2 minutes.\n5. Add vegetables, turmeric, and salt. Sauté for 2-3 minutes.\n6. Add rice, mix well. Add 4 cups of water.\n7. Cover and cook until rice is done and water is absorbed.\n8. Garnish with mint leaves.",
      estimatedCookingTime: "45 minutes",
      proteinContent: "4g Protein",
      youtubeVideos: [{
        title: "Easy Vegetable Pulao Recipe",
        url: "https://www.youtube.com/results?search_query=vegetable+pulao+recipe",
        thumbnailUrl: "https://picsum.photos/seed/vegpulao/320/180"
      }],
      imageDataUri: "https://picsum.photos/seed/vegpulao/400/300"
    });
    
    matchedRecipes.push({
      name: "Chana Masala",
      description: "A popular North Indian dish with chickpeas in a spicy tomato gravy.",
      ingredients: "Chickpeas (Chana) - 2 cups, soaked overnight and boiled\nOnion - 1 large\nTomatoes - 2 medium\nGinger-garlic paste - 1 tbsp\nGreen chilies - 2\nCumin seeds - 1 tsp\nTurmeric - 1/2 tsp\nRed chili powder - 1 tsp\nCoriander powder - 1 tsp\nGaram masala - 1 tsp\nSalt - to taste\nOil - 3 tbsp\nCoriander leaves - for garnish",
      instructions: "1. Heat oil, add cumin seeds until they splutter.\n2. Add chopped onions, sauté until golden brown.\n3. Add ginger-garlic paste, green chilies, cook for 2 minutes.\n4. Add chopped tomatoes, turmeric, red chili powder, coriander powder, and salt.\n5. Cook until tomatoes are soft and oil separates.\n6. Add boiled chickpeas and 1 cup of water.\n7. Simmer for 15 minutes until gravy thickens.\n8. Add garam masala, mix well.\n9. Garnish with coriander leaves.",
      estimatedCookingTime: "30 minutes (plus soaking time)",
      proteinContent: "10g Protein",
      youtubeVideos: [{
        title: "Authentic Chana Masala Recipe",
        url: "https://www.youtube.com/results?search_query=chana+masala+recipe",
        thumbnailUrl: "https://picsum.photos/seed/chanamasala/320/180"
      }],
      imageDataUri: "https://picsum.photos/seed/chanamasala/400/300"
    });
  }
  
  // Return at least 3 recipes
  while (matchedRecipes.length < 3) {
    // Add vegetable curry as filler
    matchedRecipes.push(commonRecipes.vegetable);
  }
  
  return matchedRecipes;
}

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
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      if (!apiKey) {
        console.error('YouTube API key is missing in environment variables');
        return getFallbackToolVideos(query);
      }
      
      const encodedQuery = encodeURIComponent(`Recipe for '${query}'`);
      const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=3&q=${encodedQuery}&key=${apiKey}`;

      console.log(`Fetching YouTube videos for query: "${query}"`);
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`YouTube API failed with status ${response.status}: ${errorText}`);
        return getFallbackToolVideos(query);
      }
      
      const data = await response.json();

      if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
        console.warn(`No YouTube videos found for: ${query}`);
        return getFallbackToolVideos(query);
      }

      const videos = data.items.map((item) => {
        const videoId = item.id.videoId;
        return {
          title: item.snippet.title,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        };
      });

      console.log(`YouTube tool fetched ${videos.length} videos for: ${query}`);
      return videos;
    } catch (error) {
      console.error(`Error fetching YouTube videos for ${query}:`, error);
      return getFallbackToolVideos(query);
    }
  }
);

/**
 * Helper function to return fallback videos for the YouTube tool
 */
function getFallbackToolVideos(query: string) {
  return [{
    title: `Search YouTube for ${query}`,
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' recipe')}`,
    thumbnailUrl: `https://picsum.photos/seed/${encodeURIComponent(query)}/320/180`, // Placeholder thumbnail
  }];
}

// Define the prompt for recipe generation (excluding image generation step)
const recipePrompt = ai.definePrompt({
  name: 'recipePrompt',
  input: {
    schema: GenerateRecipesInputSchema,
  },
  output: {
    schema: z.object({
      recipes: z.array(
        z.object({
          name: z.string().describe('The specific name of the Indian recipe (e.g., "Palak Paneer", "Aloo Gobi").'),
          description: z.string().describe('A short (1-2 sentence) appealing description of the recipe, suitable for a selection list.'),
          ingredients: z.string().describe('A list of ingredients required for the recipe, formatted with newlines or bullet points.'),
          instructions: z.string().describe('Step-by-step instructions for preparing the recipe, formatted as a numbered list.'),
          estimatedCookingTime: z.string().describe('The estimated cooking time for the recipe (e.g., "45 minutes", "1 hour").'),
          proteinContent: z.string().describe('The estimated protein content per serving, including the unit.'),
          imagePrompt: z.string().describe('A detailed, visually descriptive prompt for generating an accurate image of the finished dish.'),
          dishType: z.string().describe('The type of dish (e.g., "curry", "snack", "dessert", "main course").'),
          cuisine: z.string().describe('The regional cuisine style (e.g., "North Indian", "South Indian", "Mughlai").'),
        })
      ).describe('An array of 5 distinct Indian recipes details.'),
    }),
  },
  tools: [findYoutubeVideosTool],
  prompt: `You are an expert Indian chef specializing in diverse regional cuisines. Generate 5 distinct Indian recipes based on the provided input. Ensure variety in cuisine style, cooking method, or primary ingredients if possible.

      Consider the following input:
      {{#if vegetableName}}
      - Description/Request: {{{vegetableName}}}
      {{/if}}
      {{#if vegetableImage}}
      - Image Analysis: Base your recipe suggestions on the ingredients or dish visible in this image: {{media url=vegetableImage}}
      {{/if}}
      {{#if tags}}
      - Tags/Preferences: {{#each tags}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
      {{/if}}

      For **each** of the 5 recipes, you **must** provide:
      - name: The **specific, authentic name** of the Indian recipe
      - description: A **short (1-2 sentence) appealing description** of the dish
      - ingredients: A list of ingredients with quantities
      - instructions: Step-by-step instructions as a numbered list
      - estimatedCookingTime: The estimated total cooking time
      - proteinContent: The estimated protein content per serving
      - imagePrompt: A **highly detailed and visually descriptive prompt** for generating an accurate image
      - dishType: The type of dish (e.g., "curry", "snack", "dessert", "main course")
      - cuisine: The regional cuisine style (e.g., "North Indian", "South Indian", "Mughlai")

      **Crucially, for each generated recipe, you MUST use the 'findYoutubeVideos' tool to find at least one relevant YouTube cooking video.** Use the specific recipe name as the query.

      If the input is a dish image (like Paneer Tikka Masala), focus on providing variations and similar dishes rather than just the exact dish. Include the original dish and 4 related dishes.

      Format the response as a JSON object conforming to the specified output schema.
      Ensure each recipe has all required fields.
      Generate exactly 5 diverse recipes based on the input.`
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

        // Search for YouTube videos with enhanced query
        try {
            const searchQuery = `${recipeDetail.name} ${recipeDetail.cuisine} recipe`;
            const videos = await getYouTubeVideos(searchQuery);
            youtubeVideos = videos;
        } catch (videoError) {
            console.error(`Failed to fetch YouTube videos for ${recipeDetail.name}:`, videoError);
        }

        // Generate image using the enhanced imagePrompt
        try {
            console.log(`Generating image for: ${recipeDetail.name} with prompt: "${recipeDetail.imagePrompt}"`);
            try {
                const { media } = await ai.generate({
                    model: 'googleai/gemini-1.5-flash',
                    prompt: recipeDetail.imagePrompt,
                    config: {
                        responseModalities: ['IMAGE'],
                    },
                    output: {
                        format: 'media',
                    },
                });
                if (media?.url && typeof media.url === 'string') {
                    imageDataUri = media.url;
                    console.log(`Successfully generated image for: ${recipeDetail.name}`);
                } else {
                    console.warn(`Image generation did not return a valid media URL for: ${recipeDetail.name}. Response:`, media);
                    imageDataUri = fallbackPlaceholderImage;
                }
            } catch (modelError) {
                console.error(`Error with image generation model for ${recipeDetail.name}:`, modelError);
                imageDataUri = fallbackPlaceholderImage;
            }
        } catch (imgError) {
            console.error(`Failed to generate image for recipe: ${recipeDetail.name}. Error: ${imgError instanceof Error ? imgError.message : String(imgError)}`);
            imageDataUri = fallbackPlaceholderImage;
        }

        // Return the complete recipe with all details
        return {
            ...recipeDetail,
            youtubeVideos: youtubeVideos.slice(0, 3),
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
