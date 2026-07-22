import { api } from './axios'

export async function uploadLogo(file: File): Promise<{ url: string }> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post('/media/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export async function uploadPortfolioImage(file: File): Promise<{ url: string; portfolioImages: string[] }> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post('/media/portfolio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export async function deletePortfolioImage(url: string): Promise<{ portfolioImages: string[] }> {
  const { data } = await api.delete('/media/portfolio', { data: { url } })
  return data.data
}
