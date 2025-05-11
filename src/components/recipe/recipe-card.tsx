// src/components/recipe/recipe-card.tsx
import type { FC } from 'react';
import type { GenerateRecipesOutput } from '@/ai/flows/generate-recipes';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Scale, Youtube } from 'lucide-react'; // Using Scale icon
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

  // Use recipe ID if available, otherwise fallback to encoded name
  const recipeUrlParam = recipe.id || encodeURIComponent(recipe.name);

  return (
    <Link href={`/app/recipe/${recipeUrlParam}`} passHref legacyBehavior>
        <a className="block group"> {/* Use anchor tag for Next.js Link */}
            <Card className="w-full h-full rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col overflow-hidden bg-card border border-border/50 group-hover:border-primary/50">
                {/* Image component with reduced height */}
                <div className="relative w-full aspect-[16/10]">
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

                <CardHeader className="pb-2 pt-3 px-4"> {/* Reduced padding */}
                    <CardTitle className="text-base font-semibold text-primary leading-snug group-hover:text-primary/90 transition-colors">
                        {recipe.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground pt-1 line-clamp-2">
                       {recipe.description || 'Delicious recipe awaits...'}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-2"> {/* Adjusted spacing */}
                        <Badge variant="secondary" className="flex items-center gap-1 py-0.5 px-2 rounded-md bg-secondary/80 text-secondary-foreground text-xs font-medium border-none"> {/* Smaller badge */}
                        <Clock className="h-3 w-3" />
                        {recipe.estimatedCookingTime || 'N/A'}
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1 py-0.5 px-2 rounded-md bg-secondary/80 text-secondary-foreground text-xs font-medium border-none"> {/* Smaller badge */}
                        <Scale className="h-3 w-3" />
                        {recipe.proteinContent || 'Protein N/A'} {/* Directly use string */}
                        </Badge>
                    </div>
                </CardHeader>

                 {/* Optional Footer - Simplified with just a hint */}
                 <CardFooter className="px-4 py-2 mt-auto bg-muted/30 border-t border-border/30 text-xs text-muted-foreground">
                     Click to view full recipe details
                 </CardFooter>
            </Card>
        </a>
    </Link>
  );
};

export default RecipeCard;
