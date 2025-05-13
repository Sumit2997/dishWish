// src/components/recipe/nutrient-analysis-modal.tsx
'use client';

import { useState, useEffect, type Dispatch, type FC, type SetStateAction } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, BarChart3, Loader2 } from 'lucide-react'; // Added Loader2 icon
import { extractNutritionInfo } from '@/services/nutrition';
import type { NutritionInfo } from '@/types/nutrition';

interface NutrientAnalysisModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  recipeName: string;
  ingredients: string; // Added ingredients prop
}

export const NutrientAnalysisModal: FC<NutrientAnalysisModalProps> = ({
  isOpen,
  setIsOpen,
  recipeName,
  ingredients,
}) => {
  const [nutritionData, setNutritionData] = useState<NutritionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch nutrition data when modal opens
  useEffect(() => {
    if (isOpen && ingredients && !nutritionData) {
      fetchNutritionData();
    }
  }, [isOpen, ingredients, recipeName]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Keep the nutrition data for reuse but reset errors
      setError(null);
    }
  }, [isOpen]);

  async function fetchNutritionData() {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await extractNutritionInfo(recipeName, ingredients);
      setNutritionData(data);
    } catch (err) {
      setError('Failed to analyze nutritional information. Please try again.');
      console.error('Error analyzing nutrition:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // Helper function to render vitamin and mineral lists
  const renderNutrientList = (items?: Array<{ name: string; amount: string; dailyValue?: string }>) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">{item.name}</span>
            <span className="font-medium text-foreground">
              {item.amount}
              {item.dailyValue && <span className="text-xs text-muted-foreground ml-1">({item.dailyValue})</span>}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-card border-border/50 rounded-lg shadow-xl text-card-foreground p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border/30 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <DialogTitle className="text-lg font-semibold text-foreground">
              Nutrition Analysis
            </DialogTitle>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 bg-transparent hover:bg-muted">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-4">
           <DialogDescription className="text-center text-muted-foreground mb-6">
               Estimated nutritional values per serving for "{recipeName}".
           </DialogDescription>

           {isLoading ? (
             <div className="flex flex-col items-center justify-center py-10">
               <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
               <p className="text-muted-foreground">Analyzing nutritional content...</p>
             </div>
           ) : error ? (
             <div className="text-center py-8">
               <p className="text-red-500">{error}</p>
               <Button onClick={fetchNutritionData} variant="outline" className="mt-4">
                 Retry Analysis
               </Button>
             </div>
           ) : nutritionData ? (
             <div className="space-y-6">
               {/* Macronutrients */}
               <div className="space-y-4">
                 <h3 className="text-sm font-semibold text-foreground">Macronutrients</h3>
                 <div className="grid grid-cols-2 gap-x-6 gap-y-3 bg-muted/30 border border-border/30 rounded-md p-4">
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-muted-foreground">Calories</span>
                     <span className="font-medium text-foreground">{nutritionData.calories}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-muted-foreground">Protein</span>
                     <span className="font-medium text-foreground">{nutritionData.protein}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-muted-foreground">Total Fat</span>
                     <span className="font-medium text-foreground">{nutritionData.fat.total}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-muted-foreground">Saturated Fat</span>
                     <span className="font-medium text-foreground">{nutritionData.fat.saturated}</span>
                   </div>
                   {nutritionData.fat.unsaturated && (
                     <div className="flex justify-between items-center text-sm">
                       <span className="text-muted-foreground">Unsaturated Fat</span>
                       <span className="font-medium text-foreground">{nutritionData.fat.unsaturated}</span>
                     </div>
                   )}
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-muted-foreground">Total Carbs</span>
                     <span className="font-medium text-foreground">{nutritionData.carbohydrates.total}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-muted-foreground">Fiber</span>
                     <span className="font-medium text-foreground">{nutritionData.carbohydrates.fiber}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-muted-foreground">Sugar</span>
                     <span className="font-medium text-foreground">{nutritionData.carbohydrates.sugar}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-muted-foreground">Sodium</span>
                     <span className="font-medium text-foreground">{nutritionData.sodium}</span>
                   </div>
                   {nutritionData.servingSize && (
                     <div className="flex justify-between items-center text-sm">
                       <span className="text-muted-foreground">Serving Size</span>
                       <span className="font-medium text-foreground">{nutritionData.servingSize}</span>
                     </div>
                   )}
                 </div>
               </div>

               {/* Vitamins if available */}
               {nutritionData.vitamins && nutritionData.vitamins.length > 0 && (
                 <div className="space-y-4">
                   <h3 className="text-sm font-semibold text-foreground">Vitamins</h3>
                   <div className="bg-muted/30 border border-border/30 rounded-md p-4">
                     {renderNutrientList(nutritionData.vitamins)}
                   </div>
                 </div>
               )}

               {/* Minerals if available */}
               {nutritionData.minerals && nutritionData.minerals.length > 0 && (
                 <div className="space-y-4">
                   <h3 className="text-sm font-semibold text-foreground">Minerals</h3>
                   <div className="bg-muted/30 border border-border/30 rounded-md p-4">
                     {renderNutrientList(nutritionData.minerals)}
                   </div>
                 </div>
               )}
             </div>
           ) : (
             <div className="text-center py-8 text-muted-foreground">
               <p>No nutritional data available.</p>
             </div>
           )}

            <p className="text-xs text-muted-foreground text-center italic pt-4">
              Disclaimer: These are estimated values based on typical ingredients and may vary. They are provided for informational purposes only and should not be considered medical advice.
            </p>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border/30 flex justify-end">
          <DialogClose asChild>
            <Button variant="outline" className="border-muted-foreground/50">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
