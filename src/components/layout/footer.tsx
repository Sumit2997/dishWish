import type { FC } from 'react';
import Link from 'next/link'; // Import Link
import { Github, Twitter, Linkedin, ChefHat } from 'lucide-react'; // Example social icons, added ChefHat
import { Button } from '@/components/ui/button';

const Footer: FC = () => {
  return (
    <footer className="py-8 md:py-12 border-t border-border/40 bg-background/95">
      <div className="container mx-auto px-4">
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-8">
           {/* Column 1: Logo & Description */}
           <div className="col-span-2 lg:col-span-2">
              {/* Updated Logo */}
              <Link href="/" className="flex items-center gap-2 mb-3">
                <div className="bg-primary p-1.5 rounded-md flex items-center justify-center">
                  <ChefHat className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl text-foreground">DishWish</span>
              </Link>
             <p className="text-sm text-muted-foreground max-w-xs">
               Your AI-powered guide to delicious Indian cooking. Generate recipes instantly.
             </p>
              {/* Social Links */}
              <div className="flex gap-3 mt-4">
                <Link href="#" passHref><Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><Twitter className="h-4 w-4" /></Button></Link>
                <Link href="#" passHref><Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><Github className="h-4 w-4" /></Button></Link>
                <Link href="#" passHref><Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><Linkedin className="h-4 w-4" /></Button></Link>
              </div>
           </div>

           {/* Column 2: Product Links */}
           <div>
             <h4 className="font-semibold text-foreground mb-3">Product</h4>
             <nav className="flex flex-col gap-2">
               {/* <Link href="/#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</Link> */}
               <Link href="/app" className="text-sm text-muted-foreground hover:text-primary transition-colors">Generator</Link>
               {/* <Link href="/#testimonials" className="text-sm text-muted-foreground hover:text-primary transition-colors">Testimonials</Link> */}
               {/* <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</Link> */}
               {/* <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Mobile App</Link> */}
             </nav>
           </div>

           {/* Column 3: Company Links */}
            <div>
             <h4 className="font-semibold text-foreground mb-3">Company</h4>
             <nav className="flex flex-col gap-2">
               <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link>
               <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</Link>
               <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link>
             </nav>
           </div>

           {/* Column 4: Legal Links */}
           <div>
             <h4 className="font-semibold text-foreground mb-3">Legal</h4>
             <nav className="flex flex-col gap-2">
               <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
               <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
               {/* <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Cookie Policy</Link> */}
             </nav>
           </div>

         </div>

         {/* Bottom Bar */}
        <div className="border-t border-border/30 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} DishWish. All rights reserved. Powered by Genkit AI ✨
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;