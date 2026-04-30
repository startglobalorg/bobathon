import { cn } from '@/lib/utils'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null
  return (
    <span
      className={cn(
        'text-xs font-medium transition-opacity',
        status === 'saving' && 'text-[#8A95A1]',
        status === 'saved' && 'text-[#1F9D55]',
        status === 'error' && 'text-[#D64545]',
      )}
    >
      {status === 'saving' && 'Saving…'}
      {status === 'saved' && 'Saved'}
      {status === 'error' && 'Save failed'}
    </span>
  )
}
