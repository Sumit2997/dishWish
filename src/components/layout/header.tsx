import { ChefHat } from 'lucide-react';
import type { FC } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Import Button

const Header: FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between"> {/* Increased height and added justify-between */}
        <Link href="/" className="flex items-center gap-2 mr-4"> {/* Link the logo/title to landing */}
          <ChefHat className="h-7 w-7 text-primary" /> {/* Slightly larger icon */}
          <span className="font-bold text-xl text-foreground">DishWish</span> {/* Adjusted text size and color */}
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-4">
          <Link href="/" passHref>
            <Button variant="ghost" className="text-foreground/80 hover:text-foreground">Home</Button>
          </Link>
           <Link href="/app" passHref>
            <Button variant="ghost" className="text-foreground/80 hover:text-foreground">Recipe Generator</Button>
          </Link>
          {/* Add more links as needed */}
        </nav>
      </div>
    </header>
  );
};

export default Header;
