'use client';

import type { FC } from 'react';
import { useState, useRef } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Camera, Loader2, Sparkles, X } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const formSchema = z.object({
  description: z.string().optional(),
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
  tags: z.array(z.string()).optional(),
}).refine(data => !!data.description || (!!data.ingredientImage && data.ingredientImage.length > 0), {
  message: 'Please describe your meal/ingredients or upload a picture.',
  path: ['description'],
});

type RecipeFormValues = z.infer<typeof formSchema>;

interface RecipeFormProps {
  onSubmit: (data: { description?: string; ingredientImage?: string; tags?: string[] }) => Promise<void>;
  isLoading: boolean;
}

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!file) return;

    // Validate file type and size
    if (file.size > MAX_FILE_SIZE) {
      form.setError('ingredientImage', { type: 'manual', message: `Max image size is 5MB.` });
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      form.setError('ingredientImage', { type: 'manual', message: 'Only .jpg, .jpeg, .png and .webp formats are supported.' });
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Clear existing errors
    form.clearErrors('ingredientImage');
    form.clearErrors('description');

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      // Clear description if image is selected
      form.setValue('description', '', { shouldValidate: true });
    };
    reader.onerror = () => {
      toast({
        variant: "destructive",
        title: "Image Error",
        description: "Failed to read the image file.",
      });
    };
    reader.readAsDataURL(file);
    
    // Create new FileList to avoid React resetting the input
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    form.setValue('ingredientImage', dataTransfer.files, { shouldValidate: true });
  };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const descValue = event.target.value;
    form.setValue('description', descValue, { shouldValidate: true });
    
    // Clear image and preview if description is typed
    if (descValue) {
      form.setValue('ingredientImage', undefined, { shouldValidate: true });
      setPreview(null);
      form.clearErrors('ingredientImage');
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
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Failed to read file"));
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

    if (!data.description && !imageDataUrl) {
      form.setError('description', { type: 'manual', message: 'Please describe your meal/ingredients or upload a picture.' });
      return;
    }

    await onSubmit({
      description: data.description,
      ingredientImage: imageDataUrl,
      tags: data.tags,
    });
  };

  const globalError = form.formState.errors.description?.type === 'manual' || form.formState.errors.description?.type === 'custom'
    ? form.formState.errors.description.message
    : null;

  return (
    <Card className="w-full max-w-md mx-auto shadow-sm bg-card border rounded-lg">
      <CardHeader className="pt-6 pb-2">
        <CardTitle className="text-2xl font-bold text-center">Find Your Recipe</CardTitle>
        <CardDescription className="text-center text-sm">
          Upload a photo or describe what you have
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4 px-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-4">
            {/* Hidden File Input */}
            <FormField
              control={form.control}
              name="ingredientImage"
              render={() => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input
                      id="ingredient-image-upload"
                      type="file"
                      accept={ACCEPTED_IMAGE_TYPES.join(',')}
                      onChange={handleImageChange}
                      ref={fileInputRef}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Image Upload Section */}
            <FormItem>
              <FormLabel className="text-sm font-medium">Upload your ingredients</FormLabel>
              <Label
                htmlFor="ingredient-image-upload"
                className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg cursor-pointer bg-secondary/30 hover:bg-muted/40 transition-colors ${
                  form.getFieldState('ingredientImage', form.formState).error 
                    ? 'border-destructive' 
                    : 'border-border'
                } ${preview ? 'p-2 h-auto' : 'h-32'}`}
              >
                {preview ? (
                  <div className="relative w-full h-48 rounded-md overflow-hidden">
                    <Image 
                      src={preview} 
                      alt="Ingredient preview" 
                      fill
                      className="object-contain"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 bg-black/50 hover:bg-black/70 text-white rounded-full"
                      onClick={(e) => {
                        e.preventDefault();
                        setPreview(null);
                        form.setValue('ingredientImage', undefined, { shouldValidate: true });
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <Camera className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Click to upload</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Max 5MB</p>
                  </div>
                )}
              </Label>
              {form.formState.errors.ingredientImage && (
                <FormMessage>{form.formState.errors.ingredientImage.message}</FormMessage>
              )}
            </FormItem>

            {/* OR Separator */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
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
                  <FormLabel className="text-sm font-medium">Describe your ingredients</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., tomatoes, onions, and garlic"
                      className="min-h-[100px]"
                      {...field}
                      onChange={handleDescriptionChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  {form.formState.errors.description?.type !== 'manual' && (
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
                  <FormLabel className="text-sm font-medium">Meal Type (Optional)</FormLabel>
                  <FormControl>
                    <ToggleGroup
                      type="multiple"
                      variant="outline"
                      className="flex flex-wrap gap-2"
                      value={field.value || []}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <TagButton value="quick" label="Quick" />
                      <TagButton value="vegetarian" label="Vegetarian" />
                      <TagButton value="healthy" label="Healthy" />
                    </ToggleGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            {globalError && (
              <p className="text-sm font-medium text-destructive text-center">
                {globalError}
              </p>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Find Recipes
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default RecipeForm;