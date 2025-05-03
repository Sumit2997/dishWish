import type { FC } from 'react';
import type { GenerateRecipesOutput } from '@/ai/flows/generate-recipes';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Clock, Scale, Youtube } from 'lucide-react'; // Replaced Protein with Scale
import Link from 'next/link';

type Recipe = GenerateRecipesOutput['recipes'][0];

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: FC<RecipeCardProps> = ({ recipe }) => {
  // Helper function to safely split and format text
  const formatList = (text: string, listType: 'ul' | 'ol' = 'ul') => {
    if (!text) return null;
    const items = text.split('\n').map(item => item.trim().replace(/^- |^\d+\.\s*/, '')).filter(Boolean);
    const ListTag = listType;
    return (
      <ListTag className={`pl-5 space-y-1 text-muted-foreground ${listType === 'ol' ? 'list-decimal' : 'list-disc'}`}>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ListTag>
    );
  };


  return (
    <Card className="w-full rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden bg-card border border-border/50">

      {/* Image component removed */}

      <CardHeader className="pb-3 pt-6 px-5"> {/* Adjusted padding */}
        <CardTitle className="text-xl font-semibold text-primary leading-snug">{recipe.name}</CardTitle>
         <div className="flex flex-wrap gap-2 pt-3"> {/* Increased top padding */}
            <Badge variant="secondary" className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-secondary/70 text-secondary-foreground text-xs font-medium"> {/* Enhanced badge styling */}
              <Clock className="h-3.5 w-3.5" /> {/* Slightly larger icon */}
              {recipe.estimatedCookingTime}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-secondary/70 text-secondary-foreground text-xs font-medium"> {/* Enhanced badge styling */}
              <Scale className="h-3.5 w-3.5" /> {/* Replaced Protein with Scale */}
              Protein: {recipe.proteinContent} {/* Added label */}
            </Badge>
          </div>
      </CardHeader>
      <CardContent className="px-5 py-4 flex-1"> {/* Adjusted padding and added flex-1 */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="ingredients">
            <AccordionTrigger className="text-base font-medium hover:no-underline pt-1 pb-2">Ingredients</AccordionTrigger> {/* Adjusted padding */}
            <AccordionContent className="pb-2"> {/* Adjusted padding */}
              {formatList(recipe.ingredients, 'ul')}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="instructions" className="border-b-0"> {/* Removed border bottom */}
            <AccordionTrigger className="text-base font-medium hover:no-underline pt-1 pb-2">Instructions</AccordionTrigger> {/* Adjusted padding */}
            <AccordionContent className="pb-2"> {/* Adjusted padding */}
              {formatList(recipe.instructions, 'ol')}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 px-5 pt-4 pb-5 bg-muted/50 border-t border-border/50"> {/* Added background and border */}
         <h4 className="text-sm font-medium text-foreground">Related Videos:</h4> {/* Use foreground color */}
         <div className="flex flex-col gap-1.5 w-full"> {/* Reduced gap */}
            {recipe.youtubeVideos && recipe.youtubeVideos.length > 0 ? (
               recipe.youtubeVideos.slice(0, 2).map((video, index) => ( // Limit to 2 videos
                <Link
                  key={index}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors group" // Use theme colors potentially via primary or accent
                >
                  <Youtube className="h-4 w-4 text-red-600 group-hover:text-red-700 transition-colors" /> {/* Use specific color for YouTube */}
                  <span className="truncate group-hover:underline">{video.title}</span>
                </Link>
               ))
            ) : (
              <p className="text-sm text-muted-foreground italic">No related videos found.</p> // Italicized text
            )}
         </div>
      </CardFooter>
    </Card>
  );
};

export default RecipeCard;
