import crypto from 'node:crypto'
import { describe, it, expect } from 'vitest'
import { verifyWebhookSignature } from '../mercadopago'

const SECRET = 'test-secret'

function sign(manifest: string, secret = SECRET) {
  return crypto.createHmac('sha256', secret).update(manifest).digest('hex')
}

function buildSignature(dataId: string, xRequestId: string, ts: string, secret = SECRET) {
  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${ts};`
  return `ts=${ts},v1=${sign(manifest, secret)}`
}

describe('verifyWebhookSignature (Mercado Pago)', () => {
  it('aceita uma assinatura válida', () => {
    const xSignature = buildSignature('123', 'req-1', '1700000000')
    const ok = verifyWebhookSignature({
      xSignature,
      xRequestId: 'req-1',
      dataId: '123',
      secret: SECRET,
    })
    expect(ok).toBe(true)
  })

  it('rejeita quando o HMAC não bate (payload adulterado)', () => {
    const xSignature = buildSignature('123', 'req-1', '1700000000')
    const ok = verifyWebhookSignature({
      xSignature,
      xRequestId: 'req-1',
      dataId: '999', // dataId diferente do usado pra assinar
      secret: SECRET,
    })
    expect(ok).toBe(false)
  })

  it('rejeita quando o segredo usado pra assinar é outro', () => {
    const xSignature = buildSignature('123', 'req-1', '1700000000', 'outro-segredo')
    const ok = verifyWebhookSignature({
      xSignature,
      xRequestId: 'req-1',
      dataId: '123',
      secret: SECRET,
    })
    expect(ok).toBe(false)
  })

  it('rejeita quando falta algum dado obrigatório', () => {
    expect(
      verifyWebhookSignature({ xSignature: undefined, xRequestId: 'req-1', dataId: '123', secret: SECRET }),
    ).toBe(false)
    expect(
      verifyWebhookSignature({
        xSignature: 'ts=1,v1=abc',
        xRequestId: undefined,
        dataId: '123',
        secret: SECRET,
      }),
    ).toBe(false)
    expect(
      verifyWebhookSignature({
        xSignature: 'ts=1,v1=abc',
        xRequestId: 'req-1',
        dataId: '123',
        secret: undefined,
      }),
    ).toBe(false)
  })

  it('rejeita um x-signature malformado (sem ts/v1)', () => {
    const ok = verifyWebhookSignature({
      xSignature: 'garbage-value',
      xRequestId: 'req-1',
      dataId: '123',
      secret: SECRET,
    })
    expect(ok).toBe(false)
  })

  it('rejeita quando v1 tem tamanho inválido (não quebra com exceção)', () => {
    const ok = verifyWebhookSignature({
      xSignature: 'ts=1700000000,v1=nao-e-hex-valido',
      xRequestId: 'req-1',
      dataId: '123',
      secret: SECRET,
    })
    expect(ok).toBe(false)
  })
})
