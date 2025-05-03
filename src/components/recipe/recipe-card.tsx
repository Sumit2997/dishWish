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


  return (
    // Enhanced card styling: rounded-xl, shadow-lg
    <Card className="w-full rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden bg-card border border-border/50">

       {/* Recipe Image */}
        <div className="relative w-full h-48 group">
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
        <CardTitle className="text-xl font-semibold text-primary leading-snug">{recipe.name}</CardTitle>
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

      <CardContent className="px-5 py-3 flex-1"> {/* Adjusted padding */}
        <Accordion type="single" collapsible className="w-full" defaultValue="ingredients">
          {/* Ingredients Section */}
          <AccordionItem value="ingredients" className="border-b border-border/30">
            <AccordionTrigger className="text-base font-medium hover:no-underline py-2 text-foreground/90">Ingredients</AccordionTrigger>
            <AccordionContent className="pt-2 pb-2 text-sm"> {/* Added text-sm */}
              {formatList(recipe.ingredients, 'ul')}
            </AccordionContent>
          </AccordionItem>
          {/* Instructions Section */}
          <AccordionItem value="instructions" className="border-b-0">
            <AccordionTrigger className="text-base font-medium hover:no-underline py-2 text-foreground/90">Instructions</AccordionTrigger>
            <AccordionContent className="pt-2 pb-2 text-sm"> {/* Added text-sm */}
              {formatList(recipe.instructions, 'ol')}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>

       {/* Suggested Videos Section */}
       <CardFooter className="flex flex-col items-start gap-3 px-5 pt-4 pb-5 bg-muted/30 border-t border-border/30"> {/* Adjusted padding */}
         <h4 className="text-sm font-medium text-foreground mb-0">Suggested Videos</h4>
         {(recipe.youtubeVideos && recipe.youtubeVideos.length > 0) ? (
           <ScrollArea className="w-full whitespace-nowrap rounded-md -ml-1"> {/* Offset padding slightly */}
             <div className="flex w-max space-x-3 p-1">
               {recipe.youtubeVideos.map((video, index) => (
                 <Link
                   key={index}
                   href={video.url}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="group relative flex-shrink-0 w-40 overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-border/30 bg-card" // Card-like appearance
                 >
                   <div className="relative h-24 w-full"> {/* Larger video thumbnail */}
                     <Image
                       src={video.thumbnailUrl || `https://picsum.photos/seed/${encodeURIComponent(video.title)}/320/180`}
                       alt={`Thumbnail for ${video.title}`}
                       layout="fill"
                       objectFit="cover"
                       className="transition-transform duration-300 group-hover:scale-105"
                       unoptimized // Often needed for external video thumbnails
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex items-end p-2">
                       <Youtube className="h-5 w-5 text-red-500 flex-shrink-0 mr-1.5 drop-shadow-md" />
                       <span className="text-xs font-semibold text-white truncate drop-shadow-md group-hover:underline">
                         Watch Video
                       </span>
                     </div>
                   </div>
                   {/* Video Title Below Thumbnail */}
                   <p className="mt-1.5 px-2 pb-2 text-xs text-muted-foreground truncate leading-snug" title={video.title}>
                     {video.title}
                   </p>
                 </Link>
               ))}
             </div>
             <ScrollBar orientation="horizontal" className="h-2"/>
           </ScrollArea>
         ) : (
           <p className="text-sm text-muted-foreground italic">No specific videos found. <Link href={`https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.name + ' recipe')}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Search on YouTube</Link></p>
         )}
       </CardFooter>

    </Card>
  );
};

export default RecipeCard;
