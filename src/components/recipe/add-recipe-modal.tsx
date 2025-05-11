'use client';

import type { Dispatch, FC, SetStateAction } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, Download, PenSquare, Sparkles, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AddRecipeModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  onSelectAIGeneration: () => void; // Callback for AI option
}

interface OptionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
  isPrimary?: boolean;
  badge?: string;
}

const OptionCard: FC<OptionCardProps> = ({ icon: Icon, title, description, onClick, isPrimary = false, badge }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center text-center p-6 rounded-lg border border-border/50 bg-secondary/30 hover:bg-accent hover:border-border transition-all duration-200 aspect-square",
      isPrimary && "border-primary/50 bg-primary/10 hover:bg-primary/20"
    )}
  >
    <Icon className={cn("h-8 w-8 mb-3", isPrimary ? "text-primary" : "text-muted-foreground")} />
    <h3 className={cn("font-semibold text-sm mb-1", isPrimary ? "text-primary" : "text-foreground")}>
      {title}
      {badge && <Badge variant="secondary" className="ml-1.5 bg-primary/80 text-primary-foreground text-[10px] px-1.5 py-0.5">{badge}</Badge>}
    </h3>
    <p className="text-xs text-muted-foreground">{description}</p>
  </button>
);


export const AddRecipeModal: FC<AddRecipeModalProps> = ({ isOpen, setIsOpen, onSelectAIGeneration }) => {
   const { toast } = useToast();

   const handleOptionClick = (optionName: string) => {
    setIsOpen(false);
    if (optionName === 'AI Recipe Suggestions') {
        onSelectAIGeneration(); // Call specific callback for AI
    } else {
        toast({
        title: `${optionName} Selected`,
        description: 'This feature is coming soon!',
        });
    }
   };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] my-4 overflow-auto bg-card border-border/50 rounded-lg shadow-xl text-card-foreground">
        <DialogHeader className="text-center pt-8 pb-4">
          <DialogTitle className="text-2xl font-bold text-foreground">
            Add recipe
          </DialogTitle>
          <DialogDescription className="pt-1 text-muted-foreground">
             Choose how you want to add your recipe.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 px-8 pb-8 pt-2">
            <OptionCard
                icon={Sparkles}
                title="AI Recipe Suggestions"
                description="Get recipe ideas from ingredients or preferences"
                onClick={() => handleOptionClick('AI Recipe Suggestions')}
                isPrimary // Highlight AI option
            />
             <OptionCard
                icon={Camera}
                title="Scan Recipe"
                description="Digitize from cookbooks, cards or magazines"
                onClick={() => handleOptionClick('Scan Recipe')}
                // Removed Plus badge
            />
             <OptionCard
                icon={Download}
                title="Import"
                description="From other websites and apps"
                onClick={() => handleOptionClick('Import')}
            />
             <OptionCard
                icon={PenSquare}
                title="Create Recipe"
                description="Add your own recipe manually"
                onClick={() => handleOptionClick('Create Recipe')}
            />
        </div>

         {/* Close button added manually */}
         <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            onClick={() => setIsOpen(false)}
         >
           <X className="h-4 w-4" />
           <span className="sr-only">Close</span>
         </Button>

      </DialogContent>
    </Dialog>
  );
};
