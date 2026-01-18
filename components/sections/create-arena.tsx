'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { createArena } from '@/app/actions/arena';

export function CreateArenaButton() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Create arena</Button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-xl rounded-3xl border border-white/10 p-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Spin up a new arena</h3>
                <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">
                  ×
                </button>
              </div>
              <p className="mt-2 text-sm text-white/70">Name it, scope it, and drop a short description.</p>
              <form action={createArena} className="mt-4 space-y-3">
                <input
                  name="name"
                  placeholder="Neon Dreamscapes"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-aurora"
                  required
                />
                <input
                  name="scope_type"
                  placeholder="Photography / 3D / Concept"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-aurora"
                  required
                />
                <textarea
                  name="description"
                  placeholder="Describe the arena vibe"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-aurora"
                  rows={3}
                />
                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">
                    Launch
                  </Button>
                  <Button type="button" variant="ghost" className="flex-1" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
