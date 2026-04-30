import { cn } from '@/lib/utils'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function SaveIndicator({ status }: { status: SaveStatus }) {
  return (
    <span
      aria-live="polite"
      className={cn(
        'text-xs font-medium transition-opacity duration-200 ease-out',
        status === 'idle' && 'opacity-0',
        status === 'saving' && 'opacity-100 text-ink-400',
        status === 'saved' && 'opacity-100 text-success-ink',
        status === 'error' && 'opacity-100 text-error',
      )}
    >
      {status === 'saving' && 'Saving…'}
      {status === 'saved' && 'Saved'}
      {status === 'error' && 'Save failed'}
      {status === 'idle' && ' '}
    </span>
  )
}
