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
  try {
    console.log('Starting recipe generation with input:', {
      vegetableName: input.vegetableName,
      hasImage: !!input.vegetableImage,
      tags: input.tags
    });
    
    // Try using the flow first
    try {
      const result = await generateRecipesFlow(input);
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
    schema: GenerateRecipesInputSchema, // Use the main input schema
  },
  output: {
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
             // Use a stable model for image generation
             try {
              const { media } = await ai.generate({
                     model: 'googleai/gemini-1.5-flash', // Use more stable model
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
             } catch (modelError) {
                 console.error(`Error with image generation model for ${recipeDetail.name}:`, modelError);
                 imageDataUri = fallbackPlaceholderImage;
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
