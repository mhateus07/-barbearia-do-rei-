import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { getPublicInfo } from '../api/public.api'
import { BrandingContext, FALLBACK_BRANDING } from './branding-context'

export function BrandingProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const [branding, setBranding] = useState(FALLBACK_BRANDING)
  const [loading, setLoading] = useState(true)

  const fetchBranding = useCallback(() => {
    return getPublicInfo(slug)
      .then((info) => {
        setBranding(info)
        document.title = info.shopName
      })
      .catch(() => setBranding(FALLBACK_BRANDING))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    fetchBranding()
  }, [fetchBranding])

  return (
    <BrandingContext.Provider value={{ branding, loading, refetch: fetchBranding }}>
      {children}
    </BrandingContext.Provider>
  )
}
