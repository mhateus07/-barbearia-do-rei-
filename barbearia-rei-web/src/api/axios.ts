import axios from 'axios'

// Em produção, o front é servido no mesmo subdomínio da API de cada tenant
// (proxy reverso), então uma baseURL relativa já resolve para o tenant certo.
// VITE_API_URL continua existindo como override para dev local (front e API
// em portas/origens diferentes).
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('admin')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)
