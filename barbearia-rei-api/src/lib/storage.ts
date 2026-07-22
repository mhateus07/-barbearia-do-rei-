import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { env } from '../config/env'

// Armazenamento em disco local (VPS). Cada tenant tem sua própria subpasta,
// pra manter os arquivos organizados e evitar colisão de nomes entre tenants.
export const UPLOADS_ROOT = path.resolve(process.cwd(), env.UPLOADS_DIR)

function tenantDir(tenantId: string): string {
  const dir = path.join(UPLOADS_ROOT, tenantId)
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])

export function saveUploadedImage(tenantId: string, originalName: string, buffer: Buffer): string {
  const ext = path.extname(originalName).toLowerCase()
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error('Formato de imagem não suportado (use jpg, png, webp ou gif)')
  }

  const filename = `${crypto.randomUUID()}${ext}`
  const dir = tenantDir(tenantId)
  fs.writeFileSync(path.join(dir, filename), buffer)

  return `/uploads/${tenantId}/${filename}`
}

/** Remove um arquivo a partir da URL pública devolvida por saveUploadedImage. Silencioso se não existir. */
export function deleteUploadedImage(tenantId: string, publicUrl: string): void {
  const expectedPrefix = `/uploads/${tenantId}/`
  if (!publicUrl.startsWith(expectedPrefix)) return // nunca apaga arquivo de outro tenant

  const filename = publicUrl.slice(expectedPrefix.length)
  if (!filename || filename.includes('/') || filename.includes('..')) return

  const filePath = path.join(UPLOADS_ROOT, tenantId, filename)
  fs.rm(filePath, { force: true }, () => {})
}
