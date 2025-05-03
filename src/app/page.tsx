// src/app/page.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { CheckCircle, Zap, Users, Star, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { LoginModal } from '@/components/auth/login-modal';
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";


// Sections Data
const features = [
  {
    icon: CheckCircle,
    title: 'Easy Recipe Generation',
    description: 'Get Indian recipes instantly from vegetable names or images.',
    image: 'https://picsum.photos/seed/feature1/600/400',
    aiHint: 'recipe generation vegetable cooking',
  },
  {
    icon: Zap,
    title: 'Fast & Accurate',
    description: 'Powered by advanced AI for quick and relevant recipe suggestions.',
     image: 'https://picsum.photos/seed/feature2/600/400',
     aiHint: 'ai speed technology',
  },
  {
    icon: Users,
    title: 'Save & Organize',
    description: 'Log in to save your favorite recipes and organize your cooking (coming soon!).',
     image: 'https://picsum.photos/seed/feature3/600/400',
     aiHint: 'saving organizing folders recipes',
  },
];

const testimonials = [
  {
    quote: "DishWish changed how I cook! So easy to find new Indian recipes.",
    name: "Priya Sharma",
    title: "Home Chef",
    avatar: "https://picsum.photos/seed/avatar1/100/100",
  },
   {
    quote: "The image recognition is surprisingly accurate. Saves me so much time.",
    name: "Rohan Mehta",
    title: "Food Blogger",
     avatar: "https://picsum.photos/seed/avatar2/100/100",
  },
   {
    quote: "Finally, an app dedicated to authentic Indian recipes. Highly recommended!",
    name: "Aisha Khan",
    title: "Busy Parent",
     avatar: "https://picsum.photos/seed/avatar3/100/100",
  },
];

export default function LandingPage() {
   const { user, loading } = useAuth();
   const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-20 md:py-32 lg:py-40 bg-gradient-to-b from-background to-background/80">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight drop-shadow-md">
              The Smart Way to
              <br />
              <span className="text-primary">Generate Indian Recipes.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Turn any vegetable into a delicious Indian meal. Just enter a name or upload an image, and let our AI chef inspire you.
            </p>
            <div className="flex justify-center gap-4">
              {/* Updated Button: Navigates to /app if logged in, otherwise opens modal */}
              {user ? (
                 <Link href="/app" passHref>
                   <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 py-3 px-8 text-lg">
                     Go to Generator <ArrowRight className="ml-2 h-5 w-5" />
                   </Button>
                 </Link>
               ) : (
                 <Button
                   size="lg"
                   onClick={() => setIsLoginModalOpen(true)}
                   className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 py-3 px-8 text-lg"
                   disabled={loading}
                 >
                   Get Started for free <ArrowRight className="ml-2 h-5 w-5" />
                 </Button>
               )}
            </div>
            {/* Rating */}
             <div className="mt-8 flex justify-center items-center gap-2">
                <div className="flex">
                   {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                   ))}
                </div>
                <p className="text-sm text-muted-foreground">Loved by 75,000 cooks worldwide</p>
             </div>
             {/* <p className="text-sm text-muted-foreground mt-6">Free to use. Login to save recipes.</p> */}
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


         {/* Testimonials Section */}
         <section id="testimonials" className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12 md:mb-16">
                Loved by Food Enthusiasts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                   <Card key={index} className="bg-card border border-border/30 shadow-lg flex flex-col">
                     <CardContent className="pt-6 pb-4 flex-1">
                       <div className="flex mb-3">
                         {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                         ))}
                       </div>
                       <blockquote className="text-foreground italic mb-4">&quot;{testimonial.quote}&quot;</blockquote>
                     </CardContent>
                     <CardFooter className="flex items-center gap-3 border-t border-border/20 pt-4">
                        <Avatar>
                          <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                          <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                       <div>
                         <p className="font-semibold text-foreground">{testimonial.name}</p>
                         <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                       </div>
                     </CardFooter>
                   </Card>
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
             {/* Updated Button: Navigates to /app if logged in, otherwise opens modal */}
              {user ? (
                 <Link href="/app" passHref>
                   <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 py-3 px-8 text-lg">
                     Generate Your Next Recipe <ArrowRight className="ml-2 h-5 w-5" />
                   </Button>
                 </Link>
               ) : (
                 <Button
                   size="lg"
                   onClick={() => setIsLoginModalOpen(true)}
                   className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 py-3 px-8 text-lg"
                    disabled={loading}
                 >
                   Get Started for free <ArrowRight className="ml-2 h-5 w-5" />
                 </Button>
               )}
           </div>
         </section>
      </div>
      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} setIsOpen={setIsLoginModalOpen} />
    </>
  );
}