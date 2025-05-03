// src/components/recipe/recipe-card.tsx
import type { FC } from 'react';
import type { GenerateRecipesOutput } from '@/ai/flows/generate-recipes';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Clock, Scale, Youtube } from 'lucide-react'; // Using Scale icon for protein
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
    // Enhanced card styling: rounded-xl, shadow-lg
    // Make the whole card a link to the detail page
    <Link href={`/app/recipe/${recipeId}`} passHref legacyBehavior>
        <a className="block group"> {/* Use anchor tag for Next.js Link */}
            <Card className="w-full h-full rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden bg-card border border-border/50 group-hover:border-primary/50">

            {/* Recipe Image */}
                <div className="relative w-full h-48">
                <Image
                    src={imageUrl}
                    alt={`Image of ${recipe.name}`}
                    layout="fill" // Use fill for responsive container
                    objectFit="cover" // Cover the area
                    className="transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={recipe.imagePrompt || recipe.name} // Use prompt for better hint
                    unoptimized={isDataUri} // Important for data URIs
                    onError={(e) => {
                    // Prevent infinite loop if fallback also fails
                    if (e.currentTarget.src !== fallbackImageUrl) {
                        e.currentTarget.src = fallbackImageUrl;
                        e.currentTarget.srcset = ""; // Clear srcset as well
                        console.warn(`Failed to load image for ${recipe.name}. Falling back to placeholder.`);
                    }
                    }}
                />
                {/* Optional: Overlay for slight darkening or gradient */}
                {/* <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div> */}
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
            {/* <CardFooter className="flex flex-col items-start gap-3 px-5 pt-4 pb-5 bg-muted/30 border-t border-border/30">
                <h4 className="text-sm font-medium text-foreground mb-0">Suggested Videos</h4>
                {(recipe.youtubeVideos && recipe.youtubeVideos.length > 0) ? (
                <ScrollArea className="w-full whitespace-nowrap rounded-md -ml-1">
                    <div className="flex w-max space-x-3 p-1">
                    {recipe.youtubeVideos.slice(0, 3).map((video, index) => ( // Only show first 3 videos
                        <div
                        key={index}
                        className="group relative flex-shrink-0 w-40 overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-border/30 bg-card"
                        >
                        <div className="relative h-24 w-full">
                            <Image
                            src={video.thumbnailUrl || `https://picsum.photos/seed/${encodeURIComponent(video.title)}/320/180`}
                            alt={`Thumbnail for ${video.title}`}
                            layout="fill"
                            objectFit="cover"
                            className="transition-transform duration-300 group-hover:scale-105"
                            unoptimized
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex items-end p-2">
                            <Youtube className="h-5 w-5 text-red-500 flex-shrink-0 mr-1.5 drop-shadow-md" />
                            <span className="text-xs font-semibold text-white truncate drop-shadow-md group-hover:underline">
                                Watch Video
                            </span>
                            </div>
                        </div>
                        <p className="mt-1.5 px-2 pb-2 text-xs text-muted-foreground truncate leading-snug" title={video.title}>
                            {video.title}
                        </p>
                        </div>
                    ))}
                    </div>
                    <ScrollBar orientation="horizontal" className="h-2"/>
                </ScrollArea>
                ) : (
                <p className="text-sm text-muted-foreground italic">No specific videos found.</p>
                )}
            </CardFooter> */}

            </Card>
        </a>
    </Link>
  );
};

export default RecipeCard;
