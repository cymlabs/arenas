'use client';

import { useSupabase } from '@/components/providers/supabase-provider';
import { Button } from '../ui/button';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { env } from '@/lib/env';

export function SignInDialog() {
  const supabase = useSupabase();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string>('');

  const resolveRedirectUrl = () => {
    const origin = window.location.origin;
    const allowlist = env.redirectAllowlist;

    if (allowlist.length === 0) {
      return origin;
    }

    if (allowlist.includes(origin)) {
      return origin;
    }

    return allowlist[0];
  };

  const requestOtp = async () => {
    const redirectTo = resolveRedirectUrl();

    if (!redirectTo) {
      setStatus('Unable to send magic link: redirect URL is not configured.');
      return;
    }

    setStatus('Sending magic link...');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo
      }
    });
    if (error) {
      setStatus(error.message);
    } else {
      setStatus('Check your inbox for the sign-in link.');
    }
  };

  return (
    <div className="relative">
      <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
        Sign in
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={cn('glass-panel w-full max-w-md rounded-3xl border border-white/10 p-6')}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Sign in to battle</h2>
                <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">
                  ×
                </button>
              </div>
              <p className="mt-2 text-sm text-white/70">Email-only, passwordless magic links powered by Supabase.</p>
              <div className="mt-4 space-y-3">
                <input
                  type="email"
                  required
                  placeholder="you@galaxy.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-aurora"
                />
                <Button className="w-full" onClick={requestOtp} disabled={!email}>
                  Send magic link
                </Button>
                {status && <p className="text-xs text-white/60">{status}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
