
'use client';

import { useEffect, useState } from 'react'; // Added useState
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Loader2, ChefHat } from 'lucide-react'; // Added ChefHat
import { LoginModal } from '@/components/auth/login-modal';
import { Button } from '@/components/ui/button'; // Added Button

export default function RootPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        // User is logged in, redirect to the main app dashboard
        router.replace('/app');
      } else {
        // User is not logged in, ensure the login modal is open
        // setIsLoginModalOpen(true); // Let the button open it
      }
    }
  }, [user, authLoading, router]);

  // Show loading indicator while checking auth status
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If logged in, show loading during redirect
  if (user) {
     return (
       <div className="flex h-screen items-center justify-center bg-background">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
         <p className="ml-2 text-muted-foreground">Redirecting to your dashboard...</p>
       </div>
     );
   }

   // If not logged in (and not loading), show the landing/login prompt
   // The background image is handled by the RootLayout
   return (
     <div className="flex h-screen flex-col items-center justify-center text-center p-8">
       <div className="bg-card/90 backdrop-blur-lg p-8 md:p-12 rounded-xl shadow-2xl max-w-md w-full border border-border/30">
           <div className="flex justify-center mb-6">
             <div className="bg-primary p-3 rounded-full shadow-md">
                <ChefHat className="h-8 w-8 text-primary-foreground" />
             </div>
           </div>
           <h1 className="text-3xl md:text-4xl font-bold mb-3 text-primary drop-shadow-md">Welcome to DishWish</h1>
           <p className="text-muted-foreground mb-8">
             Discover and generate amazing Indian recipes instantly. Log in or sign up to get started!
           </p>
           <Button
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              size="lg"
            >
              Log in / Sign up
           </Button>
       </div>
       {/* Login Modal */}
       <LoginModal isOpen={isLoginModalOpen} setIsOpen={setIsLoginModalOpen} />
     </div>
   );
}
