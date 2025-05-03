// src/app/page.tsx

// Temporarily commented out redirect to diagnose routing issue
// import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';


export default function Home() {
  // redirect('/app'); // Temporarily disable redirect

  // Render simple content instead
   return (
     <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
       <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 drop-shadow-md">
         Welcome to DishWish!
       </h1>
       <p className="text-lg text-muted-foreground mb-8 max-w-xl">
         Your personal AI chef for discovering amazing Indian recipes based on the ingredients you have.
       </p>
       <Link href="/app" passHref>
         <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-xl transition-all duration-200 py-3 px-8 text-lg">
           Let&apos;s Get Cooking!
         </Button>
       </Link>
     </div>
   );
}