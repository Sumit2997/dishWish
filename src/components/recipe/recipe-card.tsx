import type { FC } from 'react';
import type { GenerateRecipesOutput } from '@/ai/flows/generate-recipes';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Clock, Protein, Youtube } from 'lucide-react';
import Link from 'next/link';

type Recipe = GenerateRecipesOutput['recipes'][0];

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary">{recipe.name}</CardTitle>
        <div className="flex flex-wrap gap-2 pt-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {recipe.estimatedCookingTime}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Protein className="h-3 w-3" />
            {recipe.proteinContent}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="ingredients">
            <AccordionTrigger className="text-base font-medium">Ingredients</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {recipe.ingredients.split('\n').map((ingredient, index) => (
                  ingredient.trim() && <li key={index}>{ingredient.trim().replace(/^- /, '')}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="instructions">
            <AccordionTrigger className="text-base font-medium">Instructions</AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                {recipe.instructions.split('\n').map((step, index) => (
                   step.trim() && <li key={index}>{step.trim().replace(/^\d+\.\s*/, '')}</li>
                ))}
              </ol>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3">
         <h4 className="text-sm font-medium text-accent-foreground">Related Videos:</h4>
         <div className="flex flex-col gap-2 w-full">
            {recipe.youtubeVideos.length > 0 ? (
               recipe.youtubeVideos.map((video, index) => (
                <Link
                  key={index}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline hover:text-blue-800 transition-colors"
                >
                  <Youtube className="h-4 w-4 text-red-600" />
                  <span className="truncate">{video.title}</span>
                </Link>
               ))
            ) : (
              <p className="text-sm text-muted-foreground">No related videos found.</p>
            )}
         </div>
      </CardFooter>
    </Card>
  );
};

export default RecipeCard;
