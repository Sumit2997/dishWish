import type {Metadata} from 'next';
import { Inter } from 'next/font/google'; // Changed from Geist to Inter for a more standard web font
import './globals.css';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';

// Using Inter font as specified in the updated globals.css approach
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'DishWish - Your Indian Recipe Generator',
  description: 'Generate delicious Indian recipes from vegetables or images.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
       {/* Removed background styling from body, will apply specific backgrounds per page */}
      <body className="min-h-screen bg-background font-sans antialiased flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main> {/* Ensure main content takes up space */}
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
