// src/app/app/cookbooks/page.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Check } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { CreateCookbookModal } from '@/components/cookbooks/create-cookbook-modal'; // Import the modal

interface Cookbook {
  id: string;
  name: string;
  recipeCount: number;
  imageUrl: string;
  stored: boolean;
}

const CookbooksPage = () => {
  const [cookbooks, setCookbooks] = useState<Cookbook[]>([
     {
       id: 'family',
       name: 'Family Recipes',
       recipeCount: 4,
       imageUrl: 'https://picsum.photos/seed/burger/200/250', // Placeholder, replace with relevant image
       stored: true,
     },
  ]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // State for modal visibility

  // Function to handle opening the modal
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  // Function passed to the modal to actually create the cookbook
  const handleCreateCookbook = (name: string) => {
     console.log('Creating cookbook:', name);
     const newCookbook: Cookbook = {
       id: `new-${Date.now()}`, // Simple unique ID
       name: name,
       recipeCount: 0,
       imageUrl: `https://picsum.photos/seed/${encodeURIComponent(name)}/200/250`, // Use name for seed
       stored: false, // New cookbooks aren't "stored" by default (whatever that means)
     };
     setCookbooks(prev => [...prev, newCookbook]);
  };


  return (
    <>
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
                onClick={handleOpenCreateModal} // Open the modal
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
                 onClick={handleOpenCreateModal} // Open the modal
              >
                <Plus className="mr-1.5 h-4 w-4" /> Create cookbook
              </Button>
              {/* Curvy arrow graphic */}
               <svg width="60" height="60" viewBox="0 0 100 100" className="mt-8 text-muted-foreground/50" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path d="M30 70 C 40 85, 60 85, 70 70" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
                   <path d="M65 65 L 70 70 L 75 65" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                   <path d="M25 75 C 35 90, 55 90, 65 75" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" className="opacity-70 translate-x-1 translate-y-2" />
               </svg>
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
                    unoptimized={cookbook.imageUrl.startsWith('data:')} // Add unoptimized for data URIs if needed
                     onError={(e) => {
                       const target = e.target as HTMLImageElement;
                       const fallbackUrl = `https://picsum.photos/seed/${encodeURIComponent(cookbook.name)}/200/250`;
                       if (target.src !== fallbackUrl) {
                           target.src = fallbackUrl;
                           target.srcset = "";
                       }
                     }}
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
                {/* Empty state after showing existing cookbooks, replaced by a simple "Create cookbook" card */}
               <Card
                 className="group relative aspect-[3/4] overflow-hidden rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 hover:bg-muted/30 hover:border-primary/50 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center"
                 onClick={handleOpenCreateModal} // Open the modal
               >
                 <div className="p-4">
                   <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                   <p className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                     Create cookbook
                   </p>
                 </div>
               </Card>
            </div>
          )}
        </div>

       {/* Render the Create Cookbook Modal */}
       <CreateCookbookModal
         isOpen={isCreateModalOpen}
         setIsOpen={setIsCreateModalOpen}
         onCreateCookbook={handleCreateCookbook}
       />
    </>
  );
};

export default CookbooksPage;
