import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

export const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aurora shadow-glow',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-aurora/80 via-white/20 to-plasma/80 text-white hover:shadow-neon hover:-translate-y-0.5',
        ghost: 'bg-white/5 text-white hover:bg-white/10 border border-white/10',
        muted: 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
      },
      size: {
        sm: 'px-3 py-1 text-xs',
        md: 'px-5 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  }
);
Button.displayName = 'Button';
