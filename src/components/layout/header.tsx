import { ChefHat } from 'lucide-react';
import type { FC } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Import Button

const Header: FC = () => {
  return (
    <header className="sticky top-0 right-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center"> {/* Added padding for better spacing */}
      <div className="flex h-16 items-center justify-around w-full"> {/* Increased height and added justify-between */}
        {/* Logo and Title Link */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <ChefHat className="h-7 w-7 text-primary" /> {/* Slightly larger icon, Green */}
          <span className="font-bold text-xl text-foreground">DishWish</span> {/* Adjusted text size */}
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6">
          <Link href="/#features" passHref>
            <Button variant="ghost" className="text-foreground/80 hover:text-foreground hover:bg-accent/10">Features</Button>
          </Link>
          {/* Link to the main app page */}
          <Link href="/app" passHref>
            <Button variant="ghost" className="text-foreground/80 hover:text-foreground hover:bg-accent/10">Generate Recipes</Button>
          </Link>
        </nav>

         {/* Call to Action Button */}
         <div className="flex items-center gap-2">
            <Link href="/app" passHref>
                 <Button className="bg-primary hover:bg-primary/90 text-primary-foreground hidden sm:inline-flex">
                      Create Recipe
                 </Button>
            </Link>
             {/* Add Mobile Menu Trigger here if needed */}
         </div>
      </div>
    </header>
  );
};

export default Header;
