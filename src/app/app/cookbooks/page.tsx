// src/app/app/cookbooks/page.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Check } from 'lucide-react'; // Added Check icon
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent } from '@/components/ui/card'; // Removed CardHeader, CardTitle
import Image from 'next/image';

interface Cookbook {
  id: string;
  name: string;
  recipeCount: number;
  imageUrl: string;
  stored: boolean; // Added stored status
}

const CookbooksPage = () => {
  // State to manage cookbooks - initially empty to show the placeholder
  const [cookbooks, setCookbooks] = useState<Cookbook[]>([
    // Pre-populate with one example as shown in the image
     {
       id: 'family',
       name: 'Family Recipes',
       recipeCount: 4,
       imageUrl: 'https://picsum.photos/seed/burger/200/250', // Placeholder, replace with relevant image
       stored: true,
     },
  ]);

  const handleCreateCookbook = () => {
    // Placeholder function for creating a new cookbook
    console.log('Create cookbook clicked');
    // In a real app, this would likely open a modal or navigate to a create page
     // For demo, add a new placeholder cookbook
     setCookbooks(prev => [...prev, {
       id: `new-${Date.now()}`,
       name: 'My New Cookbook',
       recipeCount: 0,
       imageUrl: `https://picsum.photos/seed/${Date.now()}/200/250`,
       stored: false,
     }]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <header className="flex h-16 items-center gap-4 border-b border-border/50 bg-muted/30 px-6 sticky top-0 z-30 mb-6 -mx-6 md:-mx-8 lg:-mx-10">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-foreground">Cookbooks</h1>
        </div>
        <div className="ml-auto">
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleCreateCookbook}
          >
            <Plus className="mr-1.5 h-4 w-4" /> Create cookbook
          </Button>
        </div>
      </header>

      {/* Main Content */}
      {cookbooks.length === 0 ? (
        // Placeholder for creating the first cookbook
        <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
          <BookOpen className="h-16 w-16 text-muted-foreground/50 mb-6" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">Create Your First Cookbook</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Organize recipes and cook together with friends and family.
          </p>
          <Button
             className="bg-primary text-primary-foreground hover:bg-primary/90"
             onClick={handleCreateCookbook}
          >
            <Plus className="mr-1.5 h-4 w-4" /> Create cookbook
          </Button>
           {/* Add the curvy arrow graphic if possible (e.g., using SVG or an image) */}
          {/* <img src="/path/to/arrow.svg" alt="" className="mt-8" /> */}
        </div>
      ) : (
        // Grid display for existing cookbooks
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {cookbooks.map((cookbook) => (
            <Card
              key={cookbook.id}
              className="group relative aspect-[3/4] overflow-hidden rounded-lg border border-border/40 bg-card shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              onClick={() => console.log(`Navigate to cookbook ${cookbook.id}`)} // Placeholder action
            >
              <Image
                src={cookbook.imageUrl}
                alt={cookbook.name}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="cookbook cover recipe food" // Hint for image generation
              />
               {/* Dark overlay for text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

              <CardContent className="absolute bottom-0 left-0 right-0 p-4 text-primary-foreground z-10">
                 <h3 className="font-semibold text-base truncate leading-tight">{cookbook.name}</h3>
                 <p className="text-xs text-primary-foreground/80 mt-1">{cookbook.recipeCount} recipes</p>
                 {cookbook.stored && (
                   <div className="mt-2 flex items-center">
                     <span className="text-[10px] font-medium bg-green-700/80 text-green-100 px-2 py-0.5 rounded-sm flex items-center gap-1"> {/* Adjusted style */}
                       Stored <Check className="h-3 w-3" />
                     </span>
                   </div>
                 )}
              </CardContent>
            </Card>
          ))}
            {/* Empty state after showing existing cookbooks, similar to the initial state */}
           <div className="col-span-full mt-10 flex flex-col items-center justify-center text-center p-10 border border-dashed border-muted-foreground/30 rounded-lg bg-muted/20">
             <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
             <h2 className="text-xl font-semibold text-foreground mb-1">Ready for a New Collection?</h2>
             <p className="text-muted-foreground mb-5 max-w-md">
               Organize recipes and cook together with friends and family.
             </p>
             <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleCreateCookbook}
             >
               <Plus className="mr-1.5 h-4 w-4" /> Create cookbook
             </Button>
               {/* Curvy arrow graphic */}
               <svg width="60" height="60" viewBox="0 0 100 100" className="mt-4 text-muted-foreground/50" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path d="M30 70 C 40 85, 60 85, 70 70" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
                   <path d="M65 65 L 70 70 L 75 65" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                   <path d="M25 75 C 35 90, 55 90, 65 75" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" className="opacity-70 translate-x-1 translate-y-2" />
               </svg>
           </div>
        </div>
      )}
    </div>
  );
};

export default CookbooksPage;
