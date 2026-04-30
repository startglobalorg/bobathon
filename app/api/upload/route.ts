import { NextResponse } from 'next/server'
import { writeUploadedFile } from '@/lib/upload'

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const EXT_MAP: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file type. Allowed: PDF, JPEG, PNG' },
      { status: 400 },
    )
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large. Maximum size is 5MB' }, { status: 400 })
  }
  const ext = EXT_MAP[file.type]
  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = await writeUploadedFile(buffer, ext)
  return NextResponse.json({ path: filename })
}
