import type { FC } from 'react';
import type { GenerateRecipesOutput } from '@/ai/flows/generate-recipes';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Clock, Scale, Youtube } from 'lucide-react';
import Link from 'next/link';

type Recipe = GenerateRecipesOutput['recipes'][0];

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: FC<RecipeCardProps> = ({ recipe }) => {
  // Helper function to safely split and format text into bullet points or numbered list
  const formatList = (text: string | undefined, listType: 'ul' | 'ol' = 'ul') => {
    if (!text) return <p className="text-sm text-muted-foreground italic">Not available.</p>;
    // Handle both newline and potential "- " or "1. " prefixes
    const items = text.split('\n').map(item => item.trim().replace(/^- |^\d+\.\s*/, '')).filter(Boolean);
    if (items.length === 0) return <p className="text-sm text-muted-foreground italic">Not available.</p>;

    const ListTag = listType;
    return (
      <ListTag className={`pl-5 space-y-1 text-muted-foreground ${listType === 'ol' ? 'list-decimal' : 'list-disc'}`}>
        {items.map((item, index) => (
          <li key={index} className="text-sm">{item}</li> // Ensure consistent text size
        ))}
      </ListTag>
    );
  };


  return (
    <Card className="w-full rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden bg-card/80 backdrop-blur-sm border border-border/30"> {/* Adjusted card styling */}

      {/* Image component removed */}

      <CardHeader className="pb-4 pt-6 px-5"> {/* Adjusted padding */}
        <CardTitle className="text-xl font-semibold text-primary leading-snug">{recipe.name}</CardTitle>
         <div className="flex flex-wrap gap-2 pt-3"> {/* Increased top padding */}
            <Badge variant="secondary" className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-secondary/80 text-secondary-foreground text-xs font-medium shadow-sm"> {/* Enhanced badge styling */}
              <Clock className="h-3.5 w-3.5" />
              {recipe.estimatedCookingTime || 'N/A'} {/* Handle missing time */}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-secondary/80 text-secondary-foreground text-xs font-medium shadow-sm"> {/* Enhanced badge styling */}
              <Scale className="h-3.5 w-3.5" />
              {recipe.proteinContent ? `${recipe.proteinContent} Protein` : 'Protein N/A'} {/* Improved protein display */}
            </Badge>
          </div>
      </CardHeader>
      <CardContent className="px-5 py-4 flex-1"> {/* Adjusted padding and added flex-1 */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="ingredients">
            <AccordionTrigger className="text-base font-medium hover:no-underline pt-1 pb-2 text-foreground/90">Ingredients</AccordionTrigger> {/* Adjusted text color */}
            <AccordionContent className="pb-2">
              {formatList(recipe.ingredients, 'ul')}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="instructions" className="border-b-0"> {/* Removed border bottom */}
            <AccordionTrigger className="text-base font-medium hover:no-underline pt-1 pb-2 text-foreground/90">Instructions</AccordionTrigger> {/* Adjusted text color */}
            <AccordionContent className="pb-2">
              {formatList(recipe.instructions, 'ol')}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      {recipe.youtubeVideos && recipe.youtubeVideos.length > 0 && (
        <CardFooter className="flex flex-col items-start gap-2 px-5 pt-4 pb-5 bg-muted/50 border-t border-border/30"> {/* Adjusted background and border */}
          <h4 className="text-sm font-medium text-foreground">Related Videos:</h4>
          <div className="flex flex-col gap-1.5 w-full">
              {recipe.youtubeVideos.slice(0, 2).map((video, index) => ( // Limit to 2 videos
                <Link
                  key={index}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors group" // Use explicit colors for link
                >
                  <Youtube className="h-4 w-4 text-red-600 group-hover:text-red-700 transition-colors flex-shrink-0" /> {/* Added flex-shrink-0 */}
                  <span className="truncate group-hover:underline">{video.title}</span>
                </Link>
              ))
            }
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default RecipeCard;
