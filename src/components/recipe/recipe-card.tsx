import type { FC } from 'react';
import type { GenerateRecipesOutput } from '@/ai/flows/generate-recipes';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Clock, Scale, Youtube } from 'lucide-react'; // Replaced Protein with Scale
import Link from 'next/link';
import Image from 'next/image'; // Import Image
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

type Recipe = GenerateRecipesOutput['recipes'][0];

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: FC<RecipeCardProps> = ({ recipe }) => {
  // Helper function to safely split and format text into bullet points or numbered list
  const formatList = (text: string | undefined, listType: 'ul' | 'ol' = 'ul') => {
    if (!text) return <p className="text-sm text-muted-foreground italic">Not available.</p>;
    const items = text.split('\n').map(item => item.trim().replace(/^- |^\d+\.\s*/, '')).filter(Boolean);
    if (items.length === 0) return <p className="text-sm text-muted-foreground italic">Not available.</p>;

    const ListTag = listType;
    return (
      <ListTag className={`pl-5 space-y-1 text-muted-foreground ${listType === 'ol' ? 'list-decimal' : 'list-disc'}`}>
        {items.map((item, index) => (
          <li key={index} className="text-sm">{item}</li>
        ))}
      </ListTag>
    );
  };

  // Fallback image using picsum with recipe name as seed
  const fallbackImageUrl = `https://picsum.photos/seed/${encodeURIComponent(recipe.name)}/400/300`;
  // Use generated image if available, otherwise fallback
  const imageUrl = recipe.imageDataUri || fallbackImageUrl;
  // Check if the URL is a data URI (for optimization purposes)
  const isDataUri = imageUrl.startsWith('data:image');


  return (
    // Enhanced card styling: rounded-xl, shadow-lg
    <Card className="w-full rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden bg-card border border-border/50">

       {/* Recipe Image */}
        <div className="relative w-full h-48 group"> {/* Added group class for hover effect */}
           <Image
             src={imageUrl}
             alt={`Image of ${recipe.name}`}
             layout="fill"
             objectFit="cover"
             className="transition-transform duration-300 group-hover:scale-105"
             data-ai-hint={recipe.imagePrompt || recipe.name} // Use AI prompt for better hints if available
             // Add unoptimized prop if using data URIs which don't need optimization.
             unoptimized={isDataUri}
             onError={(e) => {
               // Fallback to picsum if the generated/provided image fails to load
               if (e.currentTarget.src !== fallbackImageUrl) { // Prevent infinite loop if fallback also fails
                 e.currentTarget.src = fallbackImageUrl;
                 e.currentTarget.srcset = ""; // Clear srcset
                 console.warn(`Failed to load image for ${recipe.name}. Falling back to placeholder.`);
               }
             }}
           />
         </div>


      <CardHeader className="pb-3 pt-6 px-5"> {/* Adjusted padding */}
        <CardTitle className="text-xl font-semibold text-primary leading-snug">{recipe.name}</CardTitle>
         <div className="flex flex-wrap gap-2 pt-3"> {/* Added padding top for spacing */}
            {/* Badge for Cooking Time */}
            <Badge variant="secondary" className="flex items-center gap-1.5 py-1 px-2.5 rounded-md bg-secondary/80 text-secondary-foreground text-xs font-medium shadow-sm">
              <Clock className="h-3.5 w-3.5" />
              {recipe.estimatedCookingTime || 'N/A'}
            </Badge>
             {/* Badge for Protein Content - Enhanced */}
            <Badge variant="secondary" className="flex items-center gap-1.5 py-1 px-2.5 rounded-md bg-secondary/80 text-secondary-foreground text-xs font-medium shadow-sm">
              <Scale className="h-3.5 w-3.5" />
              {recipe.proteinContent ? `${recipe.proteinContent} Protein` : 'Protein N/A'}
            </Badge>
          </div>
      </CardHeader>
      <CardContent className="px-5 py-4 flex-1"> {/* Adjusted padding */}
        <Accordion type="single" collapsible className="w-full">
          {/* Ingredients Section */}
          <AccordionItem value="ingredients">
            <AccordionTrigger className="text-base font-medium hover:no-underline pt-1 pb-2 text-foreground/90">Ingredients</AccordionTrigger>
            <AccordionContent className="pb-2">
              {formatList(recipe.ingredients, 'ul')}
            </AccordionContent>
          </AccordionItem>
          {/* Instructions Section */}
          <AccordionItem value="instructions" className="border-b-0"> {/* Removed bottom border for last item */}
            <AccordionTrigger className="text-base font-medium hover:no-underline pt-1 pb-2 text-foreground/90">Instructions</AccordionTrigger>
            <AccordionContent className="pb-2">
              {formatList(recipe.instructions, 'ol')}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>

       {/* Suggested Videos Section */}
       <CardFooter className="flex flex-col items-start gap-3 px-5 pt-4 pb-5 bg-muted/30 border-t border-border/30">
         <h4 className="text-sm font-medium text-foreground">Suggested Videos:</h4>
         {(recipe.youtubeVideos && recipe.youtubeVideos.length > 0) ? (
           <ScrollArea className="w-full whitespace-nowrap rounded-md">
             <div className="flex w-max space-x-4 p-1">
               {recipe.youtubeVideos.map((video, index) => (
                 <Link
                   key={index}
                   href={video.url}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="group relative flex-shrink-0 w-40 overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow"
                 >
                   <div className="relative h-24 w-full">
                     <Image
                       src={video.thumbnailUrl || `https://picsum.photos/seed/${encodeURIComponent(video.title)}/320/180`} // Fallback thumbnail
                       alt={`Thumbnail for ${video.title}`}
                       layout="fill"
                       objectFit="cover"
                       className="transition-transform duration-300 group-hover:scale-105"
                       unoptimized // Often needed for external video thumbnails
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-2">
                       <Youtube className="h-5 w-5 text-red-500 flex-shrink-0 mr-1.5 drop-shadow-lg" />
                       <span className="text-xs font-medium text-white truncate drop-shadow-md group-hover:underline">
                         Watch
                       </span>
                     </div>
                   </div>
                   <p className="mt-1.5 px-1 pb-1 text-xs text-muted-foreground truncate" title={video.title}>
                     {video.title}
                   </p>
                 </Link>
               ))}
             </div>
             <ScrollBar orientation="horizontal" />
           </ScrollArea>
         ) : (
           <p className="text-sm text-muted-foreground italic">No specific videos found. <Link href={`https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.name + ' recipe')}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Search on YouTube</Link></p>
         )}
       </CardFooter>

    </Card>
  );
};

export default RecipeCard;
