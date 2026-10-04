import { useEffect, useState } from 'react'

export type ThemePreference = 'light' | 'dark' | 'system'

const KEY = 'sb-theme'

function read(): ThemePreference {
  try {
    const value = localStorage.getItem(KEY)
    if (value === 'light' || value === 'dark' || value === 'system') return value
  } catch {
    // Armazenamento bloqueado: segue o padrão.
  }
  return 'light'
}

function apply(preference: ThemePreference) {
  const dark =
    preference === 'dark' ||
    (preference === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  if (dark) document.documentElement.dataset.theme = 'dark'
  else delete document.documentElement.dataset.theme
}

/** Preferência de tema do painel, salva no navegador de cada pessoa. */
export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(read)

  useEffect(() => {
    apply(preference)
    try {
      localStorage.setItem(KEY, preference)
    } catch {
      // Sem armazenamento, o tema vale só nesta sessão.
    }
    if (preference !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => apply('system')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [preference])

  return { preference, setPreference }
}
