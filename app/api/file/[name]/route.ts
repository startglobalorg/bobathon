import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import { uploadsFilePath } from '@/lib/upload'

const FILENAME_RE = /^[a-f0-9-]+\.(pdf|jpe?g|png)$/i
const CONTENT_TYPE: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params
  if (!FILENAME_RE.test(name)) {
    return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
  }
  const filePath = uploadsFilePath(name)
  try {
    const buffer = await fs.readFile(filePath)
    const ext = name.split('.').pop()!.toLowerCase()
    const contentType = CONTENT_TYPE[ext] ?? 'application/octet-stream'
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
