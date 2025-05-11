// src/components/recipe/nutrient-analysis-modal.tsx
'use client';

import type { Dispatch, FC, SetStateAction } from 'react';
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
import { X, BarChart3 } from 'lucide-react'; // Using BarChart3 for visual representation

interface NutrientAnalysisModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  recipeName: string;
}

export const NutrientAnalysisModal: FC<NutrientAnalysisModalProps> = ({
  isOpen,
  setIsOpen,
  recipeName,
}) => {
  // Placeholder data - Replace with actual data fetching/display logic
  const nutrientData = [
    { name: 'Calories', value: '450 kcal' },
    { name: 'Protein', value: '25g' },
    { name: 'Fat', value: '20g' },
    { name: 'Carbohydrates', value: '40g' },
    { name: 'Fiber', value: '8g' },
    { name: 'Sugar', value: '10g' },
    // Add more nutrients as needed
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-card border-border/50 rounded-lg shadow-xl text-card-foreground p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border/30 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <DialogTitle className="text-lg font-semibold text-foreground">
              Nutrient Analysis
            </DialogTitle>
          </div>
          <DialogClose asChild>

          </DialogClose>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-4">
           <DialogDescription className="text-center text-muted-foreground mb-6">
               Estimated values per serving for "{recipeName}".
           </DialogDescription>

           <div className="grid grid-cols-2 gap-x-6 gap-y-3 bg-muted/30 border border-border/30 rounded-md p-4">
              {nutrientData.map((nutrient) => (
                <div key={nutrient.name} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{nutrient.name}</span>
                  <span className="font-medium text-foreground">{nutrient.value}</span>
                </div>
              ))}
           </div>

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
