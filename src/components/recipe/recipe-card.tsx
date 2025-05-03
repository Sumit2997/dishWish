import type { FC } from 'react';
import type { GenerateRecipesOutput } from '@/ai/flows/generate-recipes';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Clock, Scale, Youtube } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
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
    // Updated Card Styling: Darker bg, subtle border, slight shadow on hover
    <Card className="w-full rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col overflow-hidden bg-card border border-border/50">

       {/* Recipe Image */}
        <div className="relative w-full h-48 group">
           <Image
             src={imageUrl}
             alt={`Image of ${recipe.name}`}
             layout="fill"
             objectFit="cover"
             className="transition-transform duration-300 group-hover:scale-105"
             data-ai-hint={recipe.imagePrompt || recipe.name}
             unoptimized={isDataUri}
             onError={(e) => {
               if (e.currentTarget.src !== fallbackImageUrl) {
                 e.currentTarget.src = fallbackImageUrl;
                 e.currentTarget.srcset = "";
                 console.warn(`Failed to load image for ${recipe.name}. Falling back to placeholder.`);
               }
             }}
           />
         </div>


      <CardHeader className="pb-3 pt-4 px-5">
        <CardTitle className="text-lg font-semibold text-primary leading-snug">{recipe.name}</CardTitle>
         <div className="flex flex-wrap gap-2 pt-2">
             <Badge variant="secondary" className="flex items-center gap-1.5 py-0.5 px-2 rounded-md bg-secondary/80 text-secondary-foreground text-xs font-medium">
               <Clock className="h-3 w-3" />
               {recipe.estimatedCookingTime || 'N/A'}
             </Badge>
             <Badge variant="secondary" className="flex items-center gap-1.5 py-0.5 px-2 rounded-md bg-secondary/80 text-secondary-foreground text-xs font-medium">
               <Scale className="h-3 w-3" />
               {recipe.proteinContent ? `${recipe.proteinContent} Protein` : 'Protein N/A'}
             </Badge>
           </div>
      </CardHeader>
      <CardContent className="px-5 py-3 flex-1">
        <Accordion type="single" collapsible className="w-full">
          {/* Ingredients Section */}
          <AccordionItem value="ingredients" className="border-b border-border/30">
            <AccordionTrigger className="text-sm font-medium hover:no-underline py-2 text-foreground/90">Ingredients</AccordionTrigger>
            <AccordionContent className="pt-1 pb-2">
              {formatList(recipe.ingredients, 'ul')}
            </AccordionContent>
          </AccordionItem>
          {/* Instructions Section */}
          <AccordionItem value="instructions" className="border-b-0">
            <AccordionTrigger className="text-sm font-medium hover:no-underline py-2 text-foreground/90">Instructions</AccordionTrigger>
            <AccordionContent className="pt-1 pb-2">
              {formatList(recipe.instructions, 'ol')}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>

       {/* Suggested Videos Section */}
       <CardFooter className="flex flex-col items-start gap-3 px-5 pt-3 pb-4 bg-muted/30 border-t border-border/30">
         <h4 className="text-xs font-medium text-foreground">Suggested Videos:</h4>
         {(recipe.youtubeVideos && recipe.youtubeVideos.length > 0) ? (
           <ScrollArea className="w-full whitespace-nowrap rounded-md">
             <div className="flex w-max space-x-3 p-1">
               {recipe.youtubeVideos.map((video, index) => (
                 <Link
                   key={index}
                   href={video.url}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="group relative flex-shrink-0 w-36 overflow-hidden rounded-md shadow-sm hover:shadow-md transition-shadow"
                 >
                   <div className="relative h-20 w-full"> {/* Smaller video thumbnail */}
                     <Image
                       src={video.thumbnailUrl || `https://picsum.photos/seed/${encodeURIComponent(video.title)}/320/180`}
                       alt={`Thumbnail for ${video.title}`}
                       layout="fill"
                       objectFit="cover"
                       className="transition-transform duration-300 group-hover:scale-105"
                       unoptimized // Often needed for external video thumbnails
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end p-1.5">
                       <Youtube className="h-4 w-4 text-red-500 flex-shrink-0 mr-1 drop-shadow" />
                       <span className="text-[10px] font-medium text-white truncate drop-shadow group-hover:underline">
                         Watch
                       </span>
                     </div>
                   </div>
                   <p className="mt-1 px-1 pb-0.5 text-[11px] text-muted-foreground truncate leading-tight" title={video.title}>
                     {video.title}
                   </p>
                 </Link>
               ))}
             </div>
             <ScrollBar orientation="horizontal" />
           </ScrollArea>
         ) : (
           <p className="text-xs text-muted-foreground italic">No specific videos found. <Link href={`https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.name + ' recipe')}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Search on YouTube</Link></p>
         )}
       </CardFooter>

    </Card>
  );
};

export default RecipeCard;
