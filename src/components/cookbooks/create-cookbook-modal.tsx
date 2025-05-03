// src/components/cookbooks/create-cookbook-modal.tsx
'use client';

import type { Dispatch, FC, SetStateAction } from 'react';
import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Loader2 } from 'lucide-react'; // Added Loader2
import { useToast } from '@/hooks/use-toast';

interface CreateCookbookModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  onCreateCookbook: (name: string) => void; // Callback to add the cookbook
}

export const CreateCookbookModal: FC<CreateCookbookModalProps> = ({
  isOpen,
  setIsOpen,
  onCreateCookbook,
}) => {
  const [cookbookName, setCookbookName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cookbookName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Name',
        description: 'Please enter a name for your cookbook.',
      });
      return;
    }
    setIsLoading(true);
    // Simulate API call or saving logic
    setTimeout(() => {
      onCreateCookbook(cookbookName.trim());
      toast({
        title: 'Cookbook Created',
        description: `"${cookbookName.trim()}" has been added.`,
      });
      setIsLoading(false);
      setIsOpen(false); // Close modal on success
      setCookbookName(''); // Reset name
    }, 500); // Simulate network delay
  };

   // Reset state when modal opens/closes
   const onOpenChange = (open: boolean) => {
     if (!open) {
       setCookbookName('');
       setIsLoading(false);
     }
     setIsOpen(open);
   };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-card border-border/50 rounded-lg shadow-xl text-card-foreground p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border/30 flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold text-foreground">
            Create cookbook
          </DialogTitle>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-70 hover:opacity-100"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <DialogDescription className="text-sm text-muted-foreground">
              Organize recipes and cook together with friends and family.
            </DialogDescription>
            <div>
              <Label htmlFor="cookbook-name" className="text-foreground/90">Cookbook name</Label>
              <Input
                id="cookbook-name"
                value={cookbookName}
                onChange={(e) => setCookbookName(e.target.value)}
                placeholder="Cookbook name"
                className="mt-1 bg-input border-border focus:border-primary focus:ring-primary/50"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 border-t border-border/30 flex justify-end">
             {/* Cancel button removed, close button in header handles closing */}
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading || !cookbookName.trim()}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create cookbook
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
