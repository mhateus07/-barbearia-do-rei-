import { createContext, useContext } from 'react'
import type { PublicInfo } from '../api/public.api'

export const FALLBACK_BRANDING: PublicInfo = {
  shopName: 'Minha Barbearia',
  shopPhone: '',
  shopAddress: '',
  shopInstagram: '',
  logoUrl: null,
  portfolioImages: [],
  hours: {},
}

export interface BrandingContextValue {
  branding: PublicInfo
  loading: boolean
  refetch: () => void
}

export const BrandingContext = createContext<BrandingContextValue>({
  branding: FALLBACK_BRANDING,
  loading: true,
  refetch: () => {},
})

export function useBranding() {
  return useContext(BrandingContext)
}
