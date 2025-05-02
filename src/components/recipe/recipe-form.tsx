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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
        return;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
         form.setError('vegetableImage', { type: 'manual', message: 'Only .jpg, .jpeg, .png and .webp formats are supported.' });
        setPreview(null);
        return;
      }

      // Clear existing errors if validation passes
      form.clearErrors('vegetableImage');

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        // Clear vegetable name if image is selected
        form.setValue('vegetableName', '');
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
     // Trigger validation after changing the value
    form.trigger('vegetableImage');
  };

   const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     form.setValue('vegetableName', event.target.value);
     // Clear image and preview if name is typed
     if (event.target.value) {
       form.setValue('vegetableImage', undefined);
       setPreview(null);
       // Clear image errors as well
       form.clearErrors('vegetableImage');
     }
     // Trigger validation after changing the value
     form.trigger('vegetableName');
   };


  const processSubmit: SubmitHandler<RecipeFormValues> = async (data) => {
    let imageDataUrl: string | undefined = undefined;

    if (data.vegetableImage && data.vegetableImage.length > 0) {
      const file = data.vegetableImage[0];
      imageDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    await onSubmit({
      vegetableName: data.vegetableName,
      vegetableImage: imageDataUrl,
    });
  };

   // Watch for global form error
   const globalError = form.formState.errors.vegetableName?.message === 'Please provide either a vegetable name or upload an image.' ? form.formState.errors.vegetableName.message : null;

  return (
     <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-primary">Find Your Recipe!</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Enter a vegetable name or upload its image to get delicious Indian recipes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="vegetableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vegetable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Spinach, Potato, Cauliflower" {...field} onChange={handleNameChange} disabled={isLoading}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-center text-muted-foreground my-4">OR</div>

             <FormField
              control={form.control}
              name="vegetableImage"
              render={({ field: { onChange, value, ...rest } }) => (
              <FormItem>
                 <FormLabel>Upload Vegetable Image</FormLabel>
                 <FormControl>
                      <div className="flex flex-col items-center justify-center w-full">
                        <Label
                          htmlFor="vegetable-image-upload"
                          className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted transition-colors ${form.getFieldState('vegetableImage').error ? 'border-destructive' : 'border-border'}`}
                        >
                         {preview ? (
                           <div className="relative w-full h-full">
                              <Image src={preview} alt="Vegetable preview" layout="fill" objectFit="contain" className="rounded-lg" />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                              <ImageUp className="w-8 h-8 mb-4 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                              <p className="text-xs text-muted-foreground">PNG, JPG, JPEG, WEBP (MAX. 5MB)</p>
                            </div>
                          )}
                           <Input
                            id="vegetable-image-upload"
                            type="file"
                            className="hidden"
                            accept={ACCEPTED_IMAGE_TYPES.join(',')}
                            onChange={(e) => {
                              onChange(e.target.files); // Update RHF state
                              handleImageChange(e); // Handle preview and clear name
                            }}
                            {...rest}
                            disabled={isLoading}
                          />
                        </Label>
                      </div>
                 </FormControl>
                 <FormMessage />
               </FormItem>
              )}
            />
             {globalError && <p className="text-sm font-medium text-destructive">{globalError}</p>}


            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Recipes...
                </>
              ) : (
                <>
                  <UtensilsCrossed className="mr-2 h-4 w-4" />
                   Find Recipes
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
        {/* Optionally add a footer if needed */}
      {/* <CardFooter>
         <p className="text-xs text-muted-foreground text-center w-full">Powered by Genkit</p>
      </CardFooter> */}
    </Card>
  );
};

export default RecipeForm;
