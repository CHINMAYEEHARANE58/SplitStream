import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('splitstream_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function apiError(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ detail?: string }>(error)) return error.response?.data?.detail ?? fallback
  return fallback
}
