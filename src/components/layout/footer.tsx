"use client"
import type { FC } from "react";
import { ChefHat } from "lucide-react";
import { useAuth } from "@/context/auth-context";

const Footer: FC = () => {
    const { user } = useAuth(); // Get the user from the auth context

  if (user) return null;
  return (
    <footer className="py-12 bg-background border-t border-border/40">
      <div className="container mx-auto px-4 text-center">
        {/* Logo and Description */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-3">
            <ChefHat className="h-8 w-8 text-primary" />
            <span className="font-bold text-2xl text-foreground">DishWish</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            Your AI-powered guide to delicious cooking. Generate recipes instantly and make every meal special.
          </p>
        </div>

        {/* Decorative Divider */}
        <div className="my-6 border-t border-border/30 w-2/3 mx-auto"></div>
        {/* Copyright */}
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} DishWish. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
