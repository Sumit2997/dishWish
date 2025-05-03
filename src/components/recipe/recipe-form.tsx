
'use client';

import type { FC } from 'react';
import { useState, useRef } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { Badge } from '@/components/ui/badge'; // Import Badge
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Camera, Loader2, Sparkles, Settings2, Plus, X } from 'lucide-react'; // Updated icons
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"


const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Updated Schema based on new form structure
const formSchema = z.object({
  description: z.string().optional(), // Changed from vegetableName
  ingredientImage: z
    .custom<FileList>()
    .optional()
    .refine(
      (files) => !files || files.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE,
      `Max image size is 5MB.`
    )
    .refine(
      (files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported.'
    ),
   tags: z.array(z.string()).optional(), // Added for tags
}).refine(data => !!data.description || (!!data.ingredientImage && data.ingredientImage.length > 0), {
  message: 'Please describe your meal/ingredients or upload a picture.',
  path: ['description'], // Attach error to description field
});


type RecipeFormValues = z.infer<typeof formSchema>;

interface RecipeFormProps {
  onSubmit: (data: { description?: string; ingredientImage?: string; tags?: string[] }) => Promise<void>;
  isLoading: boolean;
}

// Quick Tag Component
interface TagButtonProps {
    value: string;
    label: string;
    icon?: React.ElementType;
}
const TagButton: FC<TagButtonProps> = ({ value, label, icon: Icon }) => (
    <ToggleGroupItem
        value={value}
        aria-label={`Toggle ${label}`}
        className="flex items-center gap-1.5 px-3 py-1 h-auto text-xs border border-border bg-secondary/50 data-[state=on]:bg-primary/20 data-[state=on]:border-primary/50 data-[state=on]:text-primary hover:bg-accent"
    >
        {Icon && <Icon className="h-3 w-3" />}
        {label}
    </ToggleGroupItem>
);


const RecipeForm: FC<RecipeFormProps> = ({ onSubmit, isLoading }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      ingredientImage: undefined,
      tags: [],
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
       // Validate file type and size
       if (file.size > MAX_FILE_SIZE) {
        form.setError('ingredientImage', { type: 'manual', message: `Max image size is 5MB.` });
        setPreview(null);
        if(fileInputRef.current) fileInputRef.current.value = ''; // Reset file input visually
        return;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
         form.setError('ingredientImage', { type: 'manual', message: 'Only .jpg, .jpeg, .png and .webp formats are supported.' });
        setPreview(null);
        if(fileInputRef.current) fileInputRef.current.value = ''; // Reset file input visually
        return;
      }

      // Clear existing errors
      form.clearErrors('ingredientImage');
      form.clearErrors('description'); // Clear global error if image is valid

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        // Clear description if image is selected
        form.setValue('description', '', { shouldValidate: true });
      };
      reader.readAsDataURL(file);
      // Update RHF state
      form.setValue('ingredientImage', event.target.files, { shouldValidate: true });
    } else {
      setPreview(null);
      form.setValue('ingredientImage', undefined, { shouldValidate: true });
    }
  };

   const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
     const descValue = event.target.value;
     form.setValue('description', descValue, { shouldValidate: true });
     // Clear image and preview if description is typed
     if (descValue) {
       form.setValue('ingredientImage', undefined, { shouldValidate: true });
       setPreview(null);
        // Also clear image-specific errors
       form.clearErrors('ingredientImage');
       // Manually clear the file input visually
       if (fileInputRef.current) fileInputRef.current.value = '';
     }
   };


  const processSubmit: SubmitHandler<RecipeFormValues> = async (data) => {
    let imageDataUrl: string | undefined = undefined;

    if (data.ingredientImage && data.ingredientImage.length > 0) {
      const file = data.ingredientImage[0];
      try {
        imageDataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
      } catch (error) {
          console.error("Error reading file:", error);
          toast({
            variant: "destructive",
            title: "Image Processing Error",
            description: "Could not process the uploaded image. Please try again.",
          });
          return;
      }
    }

    // Double check refinement condition
    if (!data.description && !imageDataUrl) {
         form.setError('description', { type: 'manual', message: 'Please describe your meal/ingredients or upload a picture.' });
         return;
    }


    await onSubmit({
      description: data.description,
      ingredientImage: imageDataUrl,
      tags: data.tags,
    });
      // Reset form after successful submission? Optional.
     // form.reset();
     // setPreview(null);
  };

   // Watch for global form error
   const globalError = form.formState.errors.description?.type === 'manual' || form.formState.errors.description?.type === 'custom'
    ? form.formState.errors.description.message
    : null;


  return (
     <div className="w-full mx-auto pt-2 pb-4"> {/* Adjusted padding */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-5"> {/* Adjusted spacing */}

            {/* Hidden File Input */}
             <Input
                id="ingredient-image-upload"
                type="file"
                className="hidden"
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                onChange={handleImageChange}
                ref={fileInputRef} // Assign ref
                disabled={isLoading}
             />

             {/* Take a picture button */}
             <Button
                type="button" // Important: Prevent form submission
                variant="outline" // Style as per image
                className="w-full justify-between items-center px-4 py-3 border-border/80 bg-secondary/50 hover:bg-muted/60" // Style as per image
                onClick={() => fileInputRef.current?.click()} // Trigger hidden input
                disabled={isLoading}
             >
                 <div className="flex items-center gap-2 text-foreground/90">
                    <Camera className="h-5 w-5" />
                     <span>Take a picture of your ingredients</span>
                     {preview && (
                        <span className="text-xs text-primary">(Image selected)</span>
                     )}
                 </div>
                 <Badge variant="secondary" className="bg-primary/80 text-primary-foreground text-[10px] px-1.5 py-0.5">Pro</Badge>
             </Button>
             {/* Display image preview if available */}
              {preview && (
                <div className="relative w-full h-32 rounded-md overflow-hidden border border-border/50 mt-2">
                  <Image src={preview} alt="Ingredient preview" layout="fill" objectFit="contain" />
                   <Button
                     variant="ghost"
                     size="icon"
                     className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/70 text-white rounded-full"
                     onClick={() => {
                       setPreview(null);
                       form.setValue('ingredientImage', undefined, { shouldValidate: true });
                       if (fileInputRef.current) fileInputRef.current.value = '';
                     }}
                   >
                     <X className="h-4 w-4" />
                   </Button>
                </div>
              )}
               {/* Display image-specific errors */}
              {form.formState.errors.ingredientImage && <FormMessage>{form.formState.errors.ingredientImage.message}</FormMessage>}


            {/* OR Separator */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Description Textarea */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/90 font-semibold">Describe your meal or ingredients</FormLabel>
                  <FormControl>
                      <Textarea
                        placeholder="e.g., quick breakfast with eggs, vegetarian curry, pasta with ingredients I have..."
                        className="mt-1 bg-input border-border focus:border-primary focus:ring-primary/50 min-h-[100px] resize-none" // Adjusted styling
                        {...field}
                        onChange={handleDescriptionChange}
                        disabled={isLoading}
                      />
                  </FormControl>
                   {/* Show description validation errors if not the global refinement error */}
                   {form.formState.errors.description && form.formState.errors.description.type !== 'manual' && form.formState.errors.description.type !== 'custom' && (
                     <FormMessage />
                   )}
                </FormItem>
              )}
            />

             {/* Quick Tags */}
             <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                    <FormItem>
                        <ToggleGroup
                            type="multiple"
                            variant="outline"
                            className="flex flex-wrap gap-2 justify-start" // Changed layout
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isLoading}
                        >
                            <TagButton value="quick" label="Quick Meal" />
                            <TagButton value="vegetarian" label="Vegetarian" />
                            <TagButton value="air-fryer" label="Air Fryer" />
                            <TagButton value="one-pot" label="One Pot" />
                            <TagButton value="healthy" label="Healthy" />
                            <TagButton value="kid-friendly" label="Kid-Friendly" />
                            {/* Add more tags as needed */}
                         </ToggleGroup>
                         <FormDescription className="text-xs text-muted-foreground pt-1">
                           Tip: Include main ingredients, cooking methods, or cuisine type for better results
                         </FormDescription>
                    </FormItem>
                )}
             />


             {/* Display global refinement error here */}
             {globalError && <p className="text-sm font-medium text-destructive text-center -mt-2">{globalError}</p>}


            {/* Submit Button */}
            <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 py-3" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Recipes...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                   Find recipes for me
                </>
              )}
            </Button>

             {/* Dietary Preferences Link */}
             <div className="text-center pt-2">
                 <Button
                     type="button"
                     variant="link"
                     className="text-sm text-muted-foreground hover:text-primary p-0 h-auto"
                     disabled={isLoading}
                     // onClick={() => {/* Logic to open dietary preferences */}}
                 >
                    <Settings2 className="mr-1.5 h-4 w-4" />
                     Dietary preferences
                     <Badge variant="secondary" className="ml-1.5 bg-primary/80 text-primary-foreground text-[10px] px-1.5 py-0.5">Pro</Badge>
                 </Button>
             </div>

          </form>
        </Form>
    </div>
  );
};

export default RecipeForm;

    