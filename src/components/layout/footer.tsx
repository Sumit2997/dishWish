import type { FC } from "react";
import { ChefHat } from "lucide-react";

const Footer: FC = () => {
  return (
    <footer className="py-6 bg-background border-t border-border/40">
      <div className="container mx-auto px-4 text-center">
        {/* Logo and Description */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <ChefHat className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-foreground">DishWish</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-md mb-3">
            Your AI-powered guide to delicious Indian cooking. Generate recipes instantly and make every meal special.
          </p>
        </div>

        {/* Decorative Divider - Removed to make footer more compact */}
      </div>
    </footer>
  );
};

export default Footer;
