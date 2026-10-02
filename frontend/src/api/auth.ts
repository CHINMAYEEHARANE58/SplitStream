import { api } from './client'

export type User = { id: string; name: string; email: string; created_at: string }
type Token = { access_token: string; token_type: 'bearer' }

export async function registerUser(input: { name: string; email: string; password: string }) {
  const { data } = await api.post<User>('/auth/register', input)
  return data
}
export async function loginUser(input: { email: string; password: string }) {
  const { data } = await api.post<Token>('/auth/login', input)
  return data
}
export async function getCurrentUser() {
  const { data } = await api.get<User>('/users/me')
  return data
}
