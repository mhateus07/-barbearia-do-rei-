import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { getPublicInfo } from '../api/public.api'
import { BrandingContext, FALLBACK_BRANDING } from './branding-context'

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState(FALLBACK_BRANDING)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublicInfo()
      .then((info) => {
        setBranding(info)
        document.title = info.shopName
      })
      .catch(() => setBranding(FALLBACK_BRANDING))
      .finally(() => setLoading(false))
  }, [])

  return <BrandingContext.Provider value={{ branding, loading }}>{children}</BrandingContext.Provider>
}
