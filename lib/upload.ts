import fs from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

const UPLOADS_DIR = path.join(process.cwd(), 'uploads')

export async function ensureUploadsDir(): Promise<void> {
  await fs.mkdir(UPLOADS_DIR, { recursive: true })
}

export async function writeUploadedFile(buffer: Buffer, ext: string): Promise<string> {
  await ensureUploadsDir()
  const filename = `${randomUUID()}.${ext}`
  await fs.writeFile(path.join(UPLOADS_DIR, filename), buffer)
  return filename
}

export async function deleteUploadedFile(filename: string): Promise<void> {
  try {
    await fs.unlink(path.join(UPLOADS_DIR, filename))
  } catch (err) {
    console.error('[upload] Failed to delete file:', filename, err)
  }
}

export function uploadsFilePath(filename: string): string {
  return path.join(UPLOADS_DIR, filename)
}
