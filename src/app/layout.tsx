import type {Metadata} from 'next';
import {Geist} from 'next/font/google'; // Keep Geist as it's likely the default project font
import './globals.css';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// Removed Geist Mono as it's not specified in the UI style

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
    <html lang="en" className={geistSans.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
