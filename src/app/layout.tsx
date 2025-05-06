import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Changed from Geist to Inter for cleaner look
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans', // Use standard variable name
});

export const metadata: Metadata = {
  title: 'বাংলা গান - Bangla Song Database',
  description: 'Search, discover, and explore Bengali song lyrics and information.',
  // Add Bengali meta tags if needed
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en"> {/* Consider changing lang="bn" if primarily Bengali */}
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
