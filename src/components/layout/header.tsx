import { ChefHat } from 'lucide-react';
import type { FC } from 'react';

const Header: FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <ChefHat className="h-6 w-6 mr-2 text-primary" />
          <span className="font-bold text-lg">DishWish</span>
        </div>
        {/* Add navigation or user actions here if needed */}
      </div>
    </header>
  );
};

export default Header;
