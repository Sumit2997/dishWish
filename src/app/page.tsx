'use client';

import { CheckCircle, Zap, History, Camera, UtensilsCrossed, BarChart3, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const features = [
  {
    icon: UtensilsCrossed,
    title: 'AI-Powered Recipe Generation',
    description: 'Generate authentic Indian recipes instantly based on the ingredients you have on hand.',
    image: 'https://picsum.photos/seed/feature1/600/400',
    aiHint: 'recipe generation vegetable cooking',
  },
  {
    icon: Camera,
    title: 'Image-Based Ingredients',
    description: 'Upload a photo of your ingredients, and our AI will create recipe suggestions tailored to what you have.',
    image: 'https://picsum.photos/seed/feature2/600/400',
    aiHint: 'ai speed technology',
  },
  {
    icon: BarChart3,
    title: 'Nutritional Analysis',
    description: 'View detailed nutritional information for each recipe, including calories, protein, and more.',
    image: 'https://picsum.photos/seed/feature3/600/400',
    aiHint: 'nutrition health analysis',
  },
];

export default function RootPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 md:py-32 lg:py-40 bg-gradient-to-b from-background to-background/80">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-4 rounded-full">
              <ChefHat className="h-14 w-14 text-primary" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight drop-shadow-md">
            The Smart Way to
            <br />
            <span className="text-primary">Generate Indian Recipes</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Turn any vegetable into a delicious Indian meal. Just enter a name or upload an image, and let our AI chef inspire you.
          </p>
          <div className="flex justify-center gap-4">
             <Link href="/app" passHref>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 py-3 px-8 text-lg">
                Create Recipe Now
              </Button>
            </Link>
          </div>
           <p className="text-sm text-muted-foreground mt-6">Free to use. No signup required.</p>
        </div>
      </section>

       {/* Features Section */}
       <section id="features" className="py-16 md:py-24 bg-secondary/20">
         <div className="container mx-auto px-4">
           <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12 md:mb-16">
             Why You&apos;ll Love DishWish
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
             {features.map((feature, index) => (
               <div key={index} className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-md border border-border/30 transition-transform hover:scale-105 duration-300">
                 <feature.icon className="h-12 w-12 text-primary mb-4" />
                 <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                 <p className="text-muted-foreground">{feature.description}</p>
               </div>
             ))}
           </div>
         </div>
       </section>

       {/* Call to Action Section */}
       <section className="py-20 md:py-28 bg-gradient-to-t from-background to-background/80">
         <div className="container mx-auto px-4 text-center">
           <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
             Ready to Start Cooking?
           </h2>
           <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
             Unlock a world of delicious Indian recipes today. It&apos;s fast, free, and easy!
           </p>
           <Link href="/app" passHref>
             <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 py-3 px-8 text-lg">
               Generate Your First Recipe
             </Button>
           </Link>
         </div>
       </section>
    </div>
  );
}

