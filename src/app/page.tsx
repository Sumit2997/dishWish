'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Loader2, ChefHat, CheckCircle, Zap, Users } from 'lucide-react';
import { LoginModal } from '@/components/auth/login-modal';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

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
    title: 'Community Favorites',
    description: 'Discover popular recipes loved by our users (coming soon!).',
    image: 'https://picsum.photos/seed/feature3/600/400',
    aiHint: 'community sharing food people',
  },
];

export default function RootPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading) { 
      if (user) {
        router.replace('/app'); // Redirect to dashboard if logged in
      }
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    // <div className="flex flex-col min-h-screen w-screen bg-background">
    //   {/* Landing Section */}
    //   <div className="flex h-screen w-screen flex-col items-center justify-center text-center p-8">
    //     <div className="bg-card/90 backdrop-blur-lg p-8 md:p-12 rounded-xl shadow-2xl max-w-md w-full border border-border/30">
    //       <div className="flex justify-center mb-6">
    //         <div className="bg-primary p-3 rounded-full shadow-md">
    //           <ChefHat className="h-8 w-8 text-primary-foreground" />
    //         </div>
    //       </div>
    //       <h1 className="text-3xl md:text-4xl font-bold mb-3 text-primary drop-shadow-md">
    //         Welcome to DishWish
    //       </h1>
    //       <p className="text-muted-foreground mb-8">
    //         Discover and generate amazing Indian recipes instantly. Log in or sign up to get started!
    //       </p>
    //       <Button
    //         onClick={() => setIsLoginModalOpen(true)}
    //         className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
    //         size="lg"
    //       >
    //         Log in / Sign up
    //       </Button>
    //     </div>
    //     <LoginModal isOpen={isLoginModalOpen} setIsOpen={setIsLoginModalOpen} />
    //   </div>

    //   {/* Hero Section */}
    //   <section className="py-20 md:py-32 lg:py-40 bg-gradient-to-b from-background to-background/80 min-h-screen">
    //     <div className="container mx-auto px-4 text-center">
    //       <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight drop-shadow-md">
    //         The Smart Way to
    //         <br />
    //         <span className="text-primary">Generate Recipes.</span>
    //       </h1>
    //       <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
    //         Turn any vegetable into a delicious Indian meal. Just enter a name or upload an image, and let our AI chef inspire you.
    //       </p>
    //       <div className="flex justify-center gap-4">
    //         <Button
    //           size="lg"
    //           className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 py-3 px-8 text-lg"
    //         >
    //           Get Started Now
    //         </Button>
    //       </div>
    //       <p className="text-sm text-muted-foreground mt-6">Free to use. No signup required.</p>
    //     </div>
    //   </section>

    //   {/* Features Section */}
    //   <section id="features" className="py-16 md:py-24 bg-secondary/20 min-h-screen">
    //     <div className="container mx-auto px-4">
    //       <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12 md:mb-16">
    //         Why You&apos;ll Love DishWish
    //       </h2>
    //       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
    //         {features.map((feature, index) => (
    //           <div
    //             key={index}
    //             className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-md border border-border/30 transition-transform hover:scale-105 duration-300"
    //           >
    //             <feature.icon className="h-12 w-12 text-primary mb-4" />
    //             <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
    //             <p className="text-muted-foreground">{feature.description}</p>
    //           </div>
    //         ))}
    //       </div>
    //     </div>
    //   </section>
    // </div>
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
             <Link href="/app" passHref>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 py-3 px-8 text-lg">
                Get Started Now
              </Button>
            </Link>
             {/* Optional Secondary Button */}
             {/* <Button size="lg" variant="outline" className="text-lg py-3 px-8">Learn More</Button> */}
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
                 {/* Optional Feature Image */}
                 {/* <div className="mt-4 w-full h-40 relative rounded overflow-hidden">
                  <Image src={feature.image} alt={feature.title} layout="fill" objectFit="cover" data-ai-hint={feature.aiHint} />
                 </div> */}
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

