'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import { LoginModal } from '@/components/auth/login-modal';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// This page now primarily acts as a gatekeeper, redirecting logged-in users
// or prompting login for logged-out users.

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
        setIsLoginModalOpen(true);
      }
    }
  }, [user, authLoading, router]);

  // Show loading indicator while checking auth status
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not logged in (and not loading), show a minimal prompt or just the modal
  // The useEffect should handle opening the modal automatically.
  // This section provides a fallback view while the redirect/modal logic runs.
  if (!user) {
     return (
        <div className="flex h-screen flex-col items-center justify-center text-center p-8 bg-background">
           {/* Optionally show a message or button if modal fails to open */}
           {/* <h2 className="text-2xl font-semibold mb-4">Welcome to DishWish</h2>
           <p className="text-muted-foreground mb-6">Please log in or sign up to continue.</p>
           <Button onClick={() => setIsLoginModalOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Log in / Sign up
           </Button> */}
           {/* Login Modal should be open */}
           <LoginModal isOpen={isLoginModalOpen} setIsOpen={setIsLoginModalOpen} />
        </div>
     );
  }

  // If logged in, show loading during redirect
  return (
     <div className="flex h-screen items-center justify-center">
       <Loader2 className="h-8 w-8 animate-spin text-primary" />
       <p className="ml-2 text-muted-foreground">Redirecting...</p>
     </div>
   );
}
