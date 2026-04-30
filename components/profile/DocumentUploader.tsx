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
    <div className="rounded-xl border border-[#E6E8EB] p-4">
      <p className="text-sm font-medium text-[#0F1419] mb-3">{label}</p>
      {currentPath ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText size={20} className="text-[#0077C8] flex-shrink-0" />
            <span className="text-sm text-[#4A5560] truncate">{currentPath}</span>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1 text-xs font-medium text-[#0077C8] min-h-[44px] px-2"
            >
              <RefreshCw size={14} />
              Replace
            </button>
            <button
              onClick={onRemoved}
              className="flex items-center gap-1 text-xs font-medium text-[#D64545] min-h-[44px] px-2"
            >
              <X size={14} />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full flex flex-col items-center gap-2 py-6 rounded-lg border-2 border-dashed border-[#E6E8EB] text-[#8A95A1] hover:border-[#0077C8] hover:text-[#0077C8] transition-colors"
        >
          <Upload size={24} />
          <span className="text-sm">Upload {label}</span>
          <span className="text-xs">PDF, JPEG, or PNG · max 5MB</span>
        </button>
      )}
      {progress !== null && (
        <div className="mt-3">
          <div className="h-1.5 bg-[#F7F8FA] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0077C8] rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-[#8A95A1] mt-1 block">{progress}%</span>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-[#D64545]">{error}</p>}
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
