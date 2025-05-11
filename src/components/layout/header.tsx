"use client";
import { ChefHat } from 'lucide-react';
import type { FC } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Import Button
import { useAuth } from '@/context/auth-context';
import { useState } from 'react';
import { LoginModal } from '@/components/auth/login-modal'; // Import LoginModal

const Header: FC = () => {
  const { user } = useAuth(); // Get the user from the auth context
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // State to control login modal

  const handleGetStartedClick = () => {
    if (!user) {
      setIsLoginModalOpen(true); // Open login modal if user is not signed in
    } else {
      window.location.href = '/app'; // Redirect to the app if user is signed in
    }
  };

  if (user) return null;

  return (
    <>
      <header className="sticky top-0 right-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center">
        <div className="flex h-16 items-center justify-around w-full">
          {/* Logo and Title Link */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ChefHat className="h-7 w-7 text-primary" />
            <span className="font-bold text-xl text-foreground">DishWish</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link href="/#features" passHref>
              <Button variant="ghost" className="text-foreground/80 hover:text-foreground hover:bg-accent/10">
                Features
              </Button>
            </Link>
            <Link href="/#testimonials" passHref>
              <Button variant="ghost" className="text-foreground/80 hover:text-foreground hover:bg-accent/10">
                Testimonials
              </Button>
            </Link>
            <Link href="/app" passHref>
              <Button variant="ghost" className="text-foreground/80 hover:text-foreground hover:bg-accent/10">
                Recipe Generator
              </Button>
            </Link>
          </nav>

          {/* Call to Action Button */}
          <div className="flex items-center gap-2">
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground hidden sm:inline-flex"
              onClick={handleGetStartedClick}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} setIsOpen={setIsLoginModalOpen} />
    </>
  );
};

export default Header;
