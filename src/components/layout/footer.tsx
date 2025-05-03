import type { FC } from 'react';
import Link from 'next/link'; // Import Link

const Footer: FC = () => {
  return (
    <footer className="py-6 md:px-8 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto"> {/* Added mt-auto */}
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4"> {/* Added justify-between */}
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} DishWish. All rights reserved.
        </p>
        <div className="flex gap-4">
           {/* Example links */}
          <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Terms of Service
          </Link>
           <p className="text-sm text-muted-foreground">
              Built with ❤️ using Next.js & Genkit.
           </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
