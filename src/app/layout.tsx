import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter font
import "./globals.css";
import Header from "@/components/layout/header"; // Removed Header
import Footer from "@/components/layout/footer"; // Removed Footer
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/auth-context"; // Import AuthProvider
import { SidebarProvider } from "@/components/ui/sidebar"; // Import SidebarProvider

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DishWish - Your Indian Recipe Generator",
  description: "Generate delicious Indian recipes from vegetables or images.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Apply dark theme globally by adding 'dark' class here
    <html
      lang="en"
      className={`${inter.variable} dark`}
      suppressHydrationWarning
    >
      {/* Remove background styles from body, it will inherit from globals.css */}
      <body className="flex flex-col min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          {" "}
          {/* Wrap with AuthProvider */}
          <SidebarProvider>
            {" "}
            {/* Wrap with SidebarProvider */}
            {/* Header and Footer removed, sidebar layout will handle navigation and user info */}
            <div className="relative flex flex-col w-screen">
              <Header />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black opacity-40 z-[-1]" />{" "}
              {/*Subtle gradient overlay */}
              {children}{" "}
              {/* Children now likely include Sidebar and SidebarInset */}
              <Footer />
              <Toaster />
            </div>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
