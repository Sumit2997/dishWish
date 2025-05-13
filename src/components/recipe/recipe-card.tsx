// src/components/recipe/recipe-card.tsx
import type { FC } from 'react';
import type { Recipe } from '@/app/app/layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Scale, Youtube, BarChart3, Dumbbell } from 'lucide-react'; // Added BarChart3 and Dumbbell icons
import Link from 'next/link';
import Image from 'next/image';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from '@/components/ui/button';

interface RecipeCardProps {
  recipe: Recipe;
  onViewNutrition?: (recipeName: string, ingredients: string) => void; // Added callback for nutrition view
}

const RecipeCard: FC<RecipeCardProps> = ({ recipe, onViewNutrition }) => {
  // Helper function to safely split and format text into bullet points or numbered list
  const formatList = (text: string | undefined, listType: 'ul' | 'ol' = 'ul') => {
    if (!text) return <p className="text-sm text-muted-foreground italic">Not available.</p>;
    const items = text.split(/[\n•*-]|\d+\.\s/)
                      .map(item => item.trim())
                      .filter(Boolean);

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

  // Get the first YouTube video thumbnail if available, otherwise use fallback
  const getImageUrl = () => {
    if (recipe.youtubeVideos && recipe.youtubeVideos.length > 0 && recipe.youtubeVideos[0].thumbnailUrl) {
      return recipe.youtubeVideos[0].thumbnailUrl;
    }
    // Fallback to generated image if available
    if (recipe.imageDataUri) {
      return recipe.imageDataUri;
    }
    // Last resort fallback
    return `https://picsum.photos/seed/${encodeURIComponent(recipe.name)}/400/300`;
  };

  const imageUrl = getImageUrl();
  const isDataUri = imageUrl.startsWith('data:');

  // Use recipe ID if available, otherwise fallback to encoded name
  const recipeUrlParam = recipe.id || encodeURIComponent(recipe.name);

  // Handle viewing nutrition information
  const handleNutritionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onViewNutrition) {
      onViewNutrition(recipe.name, recipe.ingredients || '');
    }
  };

  return (
    <Card className="w-full h-full rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col overflow-hidden bg-card border border-border/50 group-hover:border-primary/50">
        {/* Image component with reduced height */}
        <div className="relative w-full aspect-[16/10]">
            <Image
                src={imageUrl}
                alt={`Image of ${recipe.name}`}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-300 group-hover:scale-105"
                unoptimized={isDataUri}
                data-ai-hint={recipe.imagePrompt || recipe.name}
                onError={(e) => {
                    const fallbackUrl = `https://picsum.photos/seed/${encodeURIComponent(recipe.name)}/400/300`;
                    if (e.currentTarget.src !== fallbackUrl) {
                        console.warn(`Failed to load image for ${recipe.name}, falling back to placeholder.`);
                        e.currentTarget.src = fallbackUrl;
                        e.currentTarget.srcset = "";
                    }
                }}
            />
        </div>

        {/* Recipe Content */}
        <div className="p-4 flex-grow flex flex-col">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {recipe.name}
                </h3>
            </div>

            {/* Dish Type and Cuisine Tags */}
            <div className="flex flex-wrap gap-2 mb-2">
                {recipe.dishType && (
                    <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                        {recipe.dishType}
                    </span>
                )}
                {recipe.cuisine && (
                    <span className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full">
                        {recipe.cuisine}
                    </span>
                )}
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {recipe.description}
            </p>

            {/* Recipe Details */}
            <div className="mt-auto space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{recipe.estimatedCookingTime}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                    <Dumbbell className="w-4 h-4 mr-1" />
                    <span>{recipe.proteinContent}</span>
                </div>
            </div>

            {/* YouTube Videos Section */}
            {recipe.youtubeVideos && recipe.youtubeVideos.length > 0 && (
                <div className="mt-3">
                    <h4 className="text-sm font-medium mb-2">Watch on YouTube</h4>
                    <div className="space-y-2">
                        {recipe.youtubeVideos.map((video, index) => (
                            <div
                                key={index}
                                className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 transition-colors"
                            >
                                <Youtube className="w-4 h-4" />
                                <a
                                    href={video.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="line-clamp-1"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {video.title}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* View Full Recipe Button */}
            <div className="mt-4">
                <Link href={`/app/recipe/${recipeUrlParam}`} passHref>
                    <Button className="w-full">
                        View Full Recipe
                    </Button>
                </Link>
            </div>
        </div>
    </Card>
  );
};

export default RecipeCard;
