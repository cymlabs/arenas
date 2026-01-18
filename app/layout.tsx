import type { Metadata } from 'next';
import './globals.css';
import { Sora } from 'next/font/google';
import { SupabaseProvider } from '@/components/providers/supabase-provider';
import { Nav } from '@/components/layout/nav';
import { cn } from '@/lib/utils';

const sora = Sora({ subsets: ['latin'], variable: '--font-sora', weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'ARENAS | Hyper-real battles',
  description: 'Tinder-style arenas for visuals and ideas.',
  metadataBase: new URL('https://arenas.local')
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(sora.variable, 'bg-[#050812]')} suppressHydrationWarning>
      <body className="min-h-screen text-white">
        <SupabaseProvider>
          <div className="relative z-10">
            <Nav />
            <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 md:pt-16">{children}</main>
          </div>
        </SupabaseProvider>
      </body>
    </html>
  );
}
