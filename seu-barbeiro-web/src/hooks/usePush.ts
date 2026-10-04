import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/axios'

export type PushState = 'unsupported' | 'needs-install' | 'denied' | 'off' | 'on' | 'loading'

const supported = () =>
  'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window

/** iPhone só recebe push com o app instalado na tela inicial. */
const iosNotInstalled = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) &&
  !window.matchMedia('(display-mode: standalone)').matches

function toKey(base64: string) {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4))
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0))
}

/** Liga e desliga as notificações deste aparelho para a pessoa logada. */
export function usePush() {
  const [state, setState] = useState<PushState>(() =>
    !supported()
      ? iosNotInstalled()
        ? 'needs-install'
        : 'unsupported'
      : Notification.permission === 'denied'
        ? 'denied'
        : 'loading',
  )

  useEffect(() => {
    if (!supported() || Notification.permission === 'denied') return
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub ? 'on' : 'off'))
      .catch(() => setState('off'))
  }, [])

  const enable = useCallback(async () => {
    const { data } = await api.get('/operations/push/key')
    if (!data.publicKey) throw new Error('Notificações ainda não foram configuradas no servidor.')
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      setState(permission === 'denied' ? 'denied' : 'off')
      throw new Error('Permissão de notificação negada neste navegador.')
    }
    const reg = await navigator.serviceWorker.ready
    const sub =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: toKey(data.publicKey),
      }))
    await api.post('/operations/push/subscribe', sub.toJSON())
    setState('on')
  }, [])

  const disable = useCallback(async () => {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      await api.post('/operations/push/unsubscribe', { endpoint: sub.endpoint }).catch(() => undefined)
      await sub.unsubscribe()
    }
    setState('off')
  }, [])

  return { state, enable, disable }
}
