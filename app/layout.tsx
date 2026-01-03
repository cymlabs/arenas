import type { Metadata } from 'next';
import './globals.css';
import { Sora } from 'next/font/google';
import { SupabaseProvider } from '@/components/providers/supabase-provider';
import { Nav } from '@/components/layout/nav';
import { cn } from '@/lib/utils';

const sora = Sora({ subsets: ['latin'], variable: '--font-sora', weight: ['400', '500', '600', '700'] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://arenas.local';

export const metadata: Metadata = {
  title: 'ARENAS | Hyper-real battles',
  description: 'Tinder-style arenas for visuals and ideas.',
  metadataBase: new URL(siteUrl)
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(sora.variable, 'bg-[#050812]')} suppressHydrationWarning>
      <body className="min-h-screen text-white">
        <a
          href="#main"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded-full focus-visible:bg-black/70 focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:text-white"
        >
          Skip to content
        </a>
        <SupabaseProvider>
          <div className="relative z-10">
            <Nav />
            <main id="main" className="mx-auto max-w-6xl px-4 pb-24 pt-10 md:pt-16">
              {children}
            </main>
          </div>
        </SupabaseProvider>
      </body>
    </html>
  );
}
