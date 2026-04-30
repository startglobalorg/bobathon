'use client'
import { useState, useRef } from 'react'
import { Upload, FileText, X, RefreshCw } from 'lucide-react'
import { uploadFile } from '@/lib/api/profile-client'

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

type Props = {
  label: string
  currentPath: string | null
  onUploaded: (path: string) => Promise<void>
  onRemoved: () => Promise<void>
}

export function DocumentUploader({ label, currentPath, onUploaded, onRemoved }: Props) {
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError(null)
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only PDF, JPEG, or PNG files allowed')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('File must be under 5MB')
      return
    }
    setProgress(0)
    try {
      const path = await uploadFile(file, setProgress)
      await onUploaded(path)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setProgress(null)
    }
  }

  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-sm font-medium text-ink-900 mb-3">{label}</p>
      {currentPath ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText size={20} className="text-accent flex-shrink-0" strokeWidth={1.5} />
            <span className="text-sm text-ink-600 truncate">{currentPath}</span>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1 text-xs font-medium text-accent-hover min-h-[44px] px-2 active:scale-95 transition-transform"
            >
              <RefreshCw size={14} strokeWidth={1.5} />
              Replace
            </button>
            <button
              type="button"
              onClick={onRemoved}
              className="flex items-center gap-1 text-xs font-medium text-error min-h-[44px] px-2 active:scale-95 transition-transform"
            >
              <X size={14} strokeWidth={1.5} />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex flex-col items-center gap-2 py-6 rounded-lg border-2 border-dashed border-border text-ink-400 hover:border-accent hover:text-accent transition-colors active:scale-[0.99]"
        >
          <Upload size={24} strokeWidth={1.5} />
          <span className="text-sm">Upload {label}</span>
          <span className="text-xs">PDF, JPEG, or PNG · max 5MB</span>
        </button>
      )}
      {progress !== null && (
        <div className="mt-3">
          <div className="h-1.5 bg-surface-soft rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-[width] duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-ink-400 mt-1 block">{progress}%</span>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-error">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
