'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, Image as ImageIcon, Youtube, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-background via-secondary/30 to-background">
      <div className="container max-w-4xl text-center py-16">
        <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4 drop-shadow-lg">
          Welcome to DishWish!
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Turn any Indian vegetable into a culinary masterpiece. Simply enter the name or upload an image, and let our AI chef conjure up delicious recipes for you.
        </p>
        <Link href="/app">
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-shadow">
            <Sparkles className="mr-2 h-5 w-5" />
            Start Cooking Now
          </Button>
        </Link>
      </div>

      <div className="container max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 mb-16">
        <Card className="bg-card/80 backdrop-blur-sm shadow-md border-border/30 hover:shadow-lg transition-shadow">
          <CardHeader className="items-center">
            <div className="p-3 bg-primary/10 rounded-full mb-3">
              <UtensilsCrossed className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Vegetable Name Input</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            Know the name of your veggie? Just type it in, and DishWish will find recipes featuring it.
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur-sm shadow-md border-border/30 hover:shadow-lg transition-shadow">
          <CardHeader className="items-center">
             <div className="p-3 bg-primary/10 rounded-full mb-3">
              <ImageIcon className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Image Upload Magic</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            Got a mystery vegetable? Upload its picture, and our AI will identify it and suggest recipes.
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur-sm shadow-md border-border/30 hover:shadow-lg transition-shadow">
          <CardHeader className="items-center">
             <div className="p-3 bg-primary/10 rounded-full mb-3">
                <Youtube className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Video Recipe Links</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            Each recipe comes with curated YouTube links to help you visualize and master the cooking process.
          </CardContent>
        </Card>
      </div>

       {/* Added an illustrative image section */}
       <div className="container max-w-5xl mb-16">
          <Image
            src="https://picsum.photos/1200/400"
            alt="Assortment of delicious Indian dishes"
            width={1200}
            height={400}
            className="rounded-lg shadow-xl object-cover"
            data-ai-hint="indian food variety collage delicious colorful"
          />
       </div>
    </div>
  );
}
