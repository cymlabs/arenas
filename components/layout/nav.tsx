import Link from 'next/link';
import { getUserSession } from '@/lib/auth';
import { Button } from '../ui/button';
import { SignInDialog } from './signin-dialog';
import { signOut } from '@/app/actions/auth';

export async function Nav() {
  const { session } = await getUserSession();
  const user = session?.user;
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-[#050812]/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-white">
          <span className="h-3 w-3 rounded-full bg-gradient-to-r from-aurora to-plasma shadow-neon" />
          ARENAS
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-sm text-white/70 hover:text-white">
            Admin
          </Link>
          {user ? (
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          ) : (
            <SignInDialog />
          )}
        </div>
      </div>
    </header>
  );
}
