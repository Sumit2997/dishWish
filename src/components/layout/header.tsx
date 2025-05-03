// src/components/layout/header.tsx
'use client';

import { ChefHat, LogOut, User, Settings } from 'lucide-react';
import type { FC } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { LoginModal } from '@/components/auth/login-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOutUser } from '@/lib/firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const Header: FC = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: 'destructive',
        title: 'Sign Out Failed',
        description: 'Could not sign you out. Please try again.',
      });
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between"> {/* Increased height */}
          {/* Logo and Title Link */}
           <Link href="/" className="flex items-center gap-2 mr-6 hover:opacity-80 transition-opacity">
             {/* Updated logo to match reference */}
             <div className="bg-primary p-1.5 rounded-md flex items-center justify-center">
                <ChefHat className="h-5 w-5 text-primary-foreground" />
             </div>
            <span className="font-bold text-xl text-foreground">DishWish</span> {/* Renamed from Mr.Cook */}
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 flex-1">
             {/* <Link href="/pricing" passHref>
               <Button variant="ghost" className="text-foreground/80 hover:text-foreground hover:bg-accent/10">Pricing</Button>
             </Link>
             <Link href="/mobile-app" passHref>
                <Button variant="ghost" className="text-foreground/80 hover:text-foreground hover:bg-accent/10">Mobile App</Button>
             </Link> */}
            <Link href="/app" passHref>
              <Button variant="ghost" className="text-foreground/80 hover:text-foreground hover:bg-accent/10">Recipe Generator</Button>
            </Link>
          </nav>

           {/* Auth Buttons / User Menu */}
           <div className="flex items-center gap-3">
             {loading ? (
                <div className="h-9 w-20 animate-pulse rounded-md bg-muted"></div> // Placeholder for loading state
             ) : user ? (
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                     <Avatar className="h-9 w-9">
                       <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                       <AvatarFallback className="bg-primary text-primary-foreground">
                         {getInitials(user.displayName)}
                       </AvatarFallback>
                     </Avatar>
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent className="w-56" align="end" forceMount>
                   <DropdownMenuLabel className="font-normal">
                     <div className="flex flex-col space-y-1">
                       <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                       <p className="text-xs leading-none text-muted-foreground">
                         {user.email}
                       </p>
                     </div>
                   </DropdownMenuLabel>
                   <DropdownMenuSeparator />
                   {/* <DropdownMenuItem>
                     <User className="mr-2 h-4 w-4" />
                     <span>Profile</span>
                   </DropdownMenuItem>
                   <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                   </DropdownMenuItem>
                   <DropdownMenuSeparator /> */}
                   <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                     <LogOut className="mr-2 h-4 w-4" />
                     <span>Log out</span>
                   </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
             ) : (
               <>
                 <Button variant="ghost" onClick={() => setIsLoginModalOpen(true)}>
                    Log in
                 </Button>
                  {/* Updated "Get Started for free" button */}
                 <Button
                   onClick={() => setIsLoginModalOpen(true)}
                   className="bg-primary hover:bg-primary/90 text-primary-foreground"
                 >
                   Get Started for free <span aria-hidden="true" className="ml-1">→</span>
                 </Button>
               </>
             )}
           </div>
        </div>
      </header>
      {/* Render Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} setIsOpen={setIsLoginModalOpen} />
    </>
  );
};

export default Header;