'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';

export type ToastPayload = { message: string; tone?: 'info' | 'error' | 'success' };

export function useToast() {
  const [toast, setToast] = useState<ToastPayload | null>(null);

  const push = useCallback((payload: ToastPayload) => {
    setToast(payload);
    setTimeout(() => setToast(null), 3600);
  }, []);

  const clear = useCallback(() => setToast(null), []);

  return { toast, push, clear };
}

export function ToastViewport({ toast, clear }: { toast: ToastPayload | null; clear: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(clear, 3600);
    return () => clearTimeout(timeout);
  }, [toast, clear]);

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 space-y-2">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className={`min-w-[240px] rounded-2xl border px-4 py-3 shadow-lg backdrop-blur ${
              toast.tone === 'error'
                ? 'border-rose-400/50 bg-rose-400/10 text-rose-50'
                : toast.tone === 'success'
                  ? 'border-emerald-300/60 bg-emerald-300/10 text-emerald-50'
                  : 'border-white/10 bg-white/10 text-white'
            }`}
          >
            <p className="text-sm leading-relaxed">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
