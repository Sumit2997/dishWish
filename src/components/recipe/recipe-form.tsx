'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'; // Added FormDescription
import { ImageUp, Loader2, UtensilsCrossed } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const formSchema = z.object({
  vegetableName: z.string().optional(),
  vegetableImage: z
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
}).refine(data => !!data.vegetableName || (!!data.vegetableImage && data.vegetableImage.length > 0), {
  message: 'Please provide either a vegetable name or upload an image.',
  path: ['vegetableName'], // Attach error to one field for display, or handle globally
});


type RecipeFormValues = z.infer<typeof formSchema>;

interface RecipeFormProps {
  onSubmit: (data: { vegetableName?: string; vegetableImage?: string }) => Promise<void>;
  isLoading: boolean;
}

const RecipeForm: FC<RecipeFormProps> = ({ onSubmit, isLoading }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vegetableName: '',
      vegetableImage: undefined,
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size client-side for better UX
       if (file.size > MAX_FILE_SIZE) {
        form.setError('vegetableImage', { type: 'manual', message: `Max image size is 5MB.` });
        setPreview(null);
        event.target.value = ''; // Reset file input
        return;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
         form.setError('vegetableImage', { type: 'manual', message: 'Only .jpg, .jpeg, .png and .webp formats are supported.' });
        setPreview(null);
        event.target.value = ''; // Reset file input
        return;
      }

      // Clear existing errors if validation passes
      form.clearErrors('vegetableImage');
      form.clearErrors('vegetableName'); // Clear global error if image is valid

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        // Clear vegetable name if image is selected
        form.setValue('vegetableName', '', { shouldValidate: true }); // Clear and validate
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
     // RHF automatically handles FileList, no need to manually trigger
  };

   const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     const nameValue = event.target.value;
     form.setValue('vegetableName', nameValue, { shouldValidate: true }); // Update and validate
     // Clear image and preview if name is typed
     if (nameValue) {
       form.setValue('vegetableImage', undefined, { shouldValidate: true }); // Clear and validate
       setPreview(null);
        // Also clear image-specific errors
       form.clearErrors('vegetableImage');
        // Manually clear the file input visually
       const fileInput = document.getElementById('vegetable-image-upload') as HTMLInputElement | null;
       if (fileInput) fileInput.value = '';
     }
   };


  const processSubmit: SubmitHandler<RecipeFormValues> = async (data) => {
    let imageDataUrl: string | undefined = undefined;

    if (data.vegetableImage && data.vegetableImage.length > 0) {
      const file = data.vegetableImage[0];
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
          return; // Stop submission if file reading fails
      }
    }

    // Double check refinement condition before submitting
    if (!data.vegetableName && !imageDataUrl) {
         form.setError('vegetableName', { type: 'manual', message: 'Please provide either a vegetable name or upload an image.' });
         return;
    }


    await onSubmit({
      vegetableName: data.vegetableName,
      vegetableImage: imageDataUrl,
    });
      // Reset form after successful submission? Optional.
     // form.reset();
     // setPreview(null);
  };

   // Watch for global form error (attached to vegetableName by refine)
   const globalError = form.formState.errors.vegetableName?.type === 'manual' || form.formState.errors.vegetableName?.type === 'custom'
    ? form.formState.errors.vegetableName.message
    : null;


  return (
     // Enhanced card styling with backdrop blur and semi-transparent background
     <Card className="w-full max-w-lg mx-auto shadow-xl bg-card/80 backdrop-blur-lg border border-border/30 rounded-xl">
      <CardHeader className="pt-8 pb-4"> {/* Adjusted padding */}
        <CardTitle className="text-3xl font-bold text-center text-primary drop-shadow-md">Find Your Recipe!</CardTitle> {/* Enhanced title */}
        <CardDescription className="text-center text-muted-foreground pt-2">
          Enter a vegetable name or upload its image to get delicious Indian recipes.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-8 px-6 md:px-8"> {/* Adjusted padding */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="vegetableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/90">Vegetable Name</FormLabel> {/* Adjusted label color */}
                  <FormControl>
                    <Input
                      placeholder="e.g., Spinach, Potato, Cauliflower"
                      {...field}
                      onChange={handleNameChange} // Use custom handler
                      disabled={isLoading}
                      className="bg-background/70 border-border/50 focus:border-primary focus:ring-primary/50" // Style input
                      />
                  </FormControl>
                   {/* Only show validation errors not related to the global refinement */}
                   {form.formState.errors.vegetableName && form.formState.errors.vegetableName.type !== 'manual' && form.formState.errors.vegetableName.type !== 'custom' && (
                     <FormMessage />
                   )}
                    <FormDescription className="text-xs">
                      Type the name of the vegetable you want to cook with.
                    </FormDescription>
                </FormItem>
              )}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card/80 px-2 text-muted-foreground">Or</span> {/* Match card bg */}
              </div>
            </div>

             <FormField
              control={form.control}
              name="vegetableImage"
              render={({ field: { onChange, value, ...rest } }) => ( // Use RHF's onChange directly for file input state
              <FormItem>
                 <FormLabel className="text-foreground/90">Upload Vegetable Image</FormLabel>
                 <FormControl>
                    {/* Input is now visually part of the label for better click handling */}
                    <Label
                      htmlFor="vegetable-image-upload"
                      className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-muted/60 transition-colors duration-200 ease-in-out ${
                        form.getFieldState('vegetableImage', form.formState).error ? 'border-destructive hover:border-destructive/80' : 'border-border/50 hover:border-border'
                      } ${preview ? 'p-2' : ''}`} // Add padding if preview exists
                    >
                      {preview ? (
                        <div className="relative w-full h-full rounded-md overflow-hidden">
                          <Image src={preview} alt="Vegetable preview" layout="fill" objectFit="contain" />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                          <ImageUp className="w-10 h-10 mb-4 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-foreground/80">Click to upload</span> or drag and drop</p>
                          <p className="text-xs text-muted-foreground">PNG, JPG, JPEG, WEBP (MAX. 5MB)</p>
                        </div>
                      )}
                      <Input
                        id="vegetable-image-upload"
                        type="file"
                        className="hidden" // Keep hidden, label handles interaction
                        accept={ACCEPTED_IMAGE_TYPES.join(',')}
                        onChange={(e) => {
                          // First, update RHF state
                          onChange(e.target.files);
                          // Then, handle preview logic
                          handleImageChange(e);
                        }}
                        {...rest} // Spread other RHF props except onChange and value
                        disabled={isLoading}
                      />
                    </Label>
                 </FormControl>
                 <FormMessage /> {/* Display image-specific errors */}
                 <FormDescription className="text-xs">
                      Alternatively, upload a clear image of the vegetable.
                 </FormDescription>
               </FormItem>
              )}
            />
             {/* Display global refinement error here */}
             {globalError && <p className="text-sm font-medium text-destructive text-center -mt-2">{globalError}</p>}


            <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-lg transition-all duration-200 py-3" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Recipes...
                </>
              ) : (
                <>
                  <UtensilsCrossed className="mr-2 h-5 w-5" />
                   Find Recipes
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      {/* Optional Footer */}
       <CardFooter className="pt-4 pb-6 justify-center">
         <p className="text-xs text-muted-foreground text-center">Powered by Genkit AI ✨</p>
      </CardFooter>
    </Card>
  );
};

export default RecipeForm;
