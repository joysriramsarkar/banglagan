
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
  title: 'বাংলা গান - আপনার গানের ডাটাবেস',
  description: 'বাংলা গানের লিরিক্স এবং তথ্য অনুসন্ধান করুন, আবিষ্কার করুন এবং অন্বেষণ করুন।',
  // Add Bengali meta tags if needed
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <head>
        <meta name="google-site-verification" content="jWk5AWz3oakP75t1oZDXp1nv4E1z3mfP149_sqV5Gh4" />
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
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
