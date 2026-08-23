import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { env } from '../config/env'
import { AppError } from './errors'

// Armazenamento em disco local (VPS). Cada tenant tem sua própria subpasta,
// pra manter os arquivos organizados e evitar colisão de nomes entre tenants.
export const UPLOADS_ROOT = path.resolve(process.cwd(), env.UPLOADS_DIR)

function tenantDir(tenantId: string): string {
  const dir = path.join(UPLOADS_ROOT, tenantId)
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])

// Assinaturas binárias (magic bytes) dos formatos aceitos — checadas além da
// extensão, pra um arquivo malicioso renomeado (ex.: .html salvo como .jpg)
// não passar só porque o nome do arquivo "parece" uma imagem.
type SignatureCheck = (buf: Buffer) => boolean

const SIGNATURE_CHECKS: Record<string, SignatureCheck> = {
  '.jpg': (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  '.jpeg': (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  '.png': (b) =>
    b.length >= 8 &&
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47 &&
    b[4] === 0x0d &&
    b[5] === 0x0a &&
    b[6] === 0x1a &&
    b[7] === 0x0a,
  '.gif': (b) =>
    b.length >= 6 &&
    b[0] === 0x47 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x38 &&
    (b[4] === 0x37 || b[4] === 0x39) &&
    b[5] === 0x61,
  '.webp': (b) =>
    b.length >= 12 &&
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50,
}

export function saveUploadedImage(tenantId: string, originalName: string, buffer: Buffer): string {
  const ext = path.extname(originalName).toLowerCase()
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new AppError('Formato de imagem não suportado (use jpg, png, webp ou gif)', 400)
  }

  const isValidSignature = SIGNATURE_CHECKS[ext]?.(buffer) ?? false
  if (!isValidSignature) {
    throw new AppError('O conteúdo do arquivo não corresponde a uma imagem válida', 400)
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
