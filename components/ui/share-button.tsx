'use client';

import { useState } from 'react';
import { Check, Link2 } from 'lucide-react';
import { buttonVariants } from './button';
import { cn } from '@/lib/utils';

export function ShareButton({ url }: { url?: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const handleCopy = async () => {
    try {
      if (!shareUrl) return;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link', error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        buttonVariants({ variant: 'ghost' }),
        'inline-flex items-center gap-2 border border-white/10 text-sm text-white/70 hover:text-white'
      )}
    >
      {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      {copied ? 'Copied' : 'Share'}
    </button>
  );
}
