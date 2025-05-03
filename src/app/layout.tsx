import type {Metadata} from 'next';
import { Inter } from 'next/font/google'; // Using Inter font
import './globals.css';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context'; // Import AuthProvider

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
    // Apply dark theme globally by adding 'dark' class here
    <html lang="en" className={`${inter.variable} dark`}>
      {/* Remove background styles from body, it will inherit from globals.css */}
      <body className="min-h-screen bg-background font-sans antialiased flex flex-col">
        <AuthProvider> {/* Wrap with AuthProvider */}
          <Header />
          <main className="flex-1 flex flex-col">{children}</main> {/* Ensure main content takes up space */}
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}