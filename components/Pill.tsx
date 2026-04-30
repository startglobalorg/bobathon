import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type Tone = 'neutral' | 'accent' | 'warm' | 'success' | 'ink';
type Size = 'sm' | 'md';

const tones: Record<Tone, string> = {
  neutral: 'bg-surface-soft text-ink-600 border border-border',
  accent: 'bg-accent-soft text-accent-hover',
  warm: 'bg-warm-soft text-warm-ink',
  success: 'bg-success-soft text-success-ink',
  ink: 'bg-ink-900 text-white',
};

const sizes: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-[12px] font-medium',
  md: 'h-8 px-3 text-[13px] font-medium',
};

export function Pill({
  children,
  tone = 'neutral',
  size = 'sm',
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  size?: Size;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full',
        tones[tone],
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
