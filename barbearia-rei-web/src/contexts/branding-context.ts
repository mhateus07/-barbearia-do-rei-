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
}

export const BrandingContext = createContext<BrandingContextValue>({
  branding: FALLBACK_BRANDING,
  loading: true,
})

export function useBranding() {
  return useContext(BrandingContext)
}
