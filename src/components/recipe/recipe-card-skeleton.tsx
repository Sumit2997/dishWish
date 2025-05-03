// src/components/recipe/recipe-card-skeleton.tsx
import type { FC } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const RecipeCardSkeleton: FC = () => {
  return (
    <Card className="w-full h-full rounded-xl shadow-lg flex flex-col overflow-hidden bg-card border border-border/50">
      {/* Image Skeleton */}
      <Skeleton className="relative w-full h-48" />

      <CardHeader className="pb-3 pt-6 px-5">
        {/* Title Skeleton */}
        <Skeleton className="h-6 w-3/4 mb-2" />
        {/* Description Skeleton */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 mt-1" />
        {/* Badges Skeleton */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-2.5">
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-24 rounded-md" />
        </div>
      </CardHeader>

      <CardContent className="px-5 py-3 flex-1">
        {/* Content Placeholder Skeleton */}
        <Skeleton className="h-4 w-1/2" />
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-3 px-5 pt-4 pb-5 bg-muted/30 border-t border-border/30">
        {/* Footer Title Skeleton */}
        <Skeleton className="h-4 w-1/3 mb-2" />
        {/* Video Thumbnails Skeleton */}
        <div className="flex w-full space-x-3 p-1 overflow-hidden">
          <Skeleton className="h-24 w-40 rounded-lg" />
          <Skeleton className="h-24 w-40 rounded-lg" />
          <Skeleton className="h-24 w-40 rounded-lg" />
        </div>
      </CardFooter>
    </Card>
  );
};

export default RecipeCardSkeleton;
