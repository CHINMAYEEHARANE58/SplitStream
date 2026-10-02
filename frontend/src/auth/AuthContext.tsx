import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getCurrentUser, loginUser, registerUser, type User } from '../api/auth'

type Credentials = { email: string; password: string }
type Registration = Credentials & { name: string }
type AuthState = { user: User | null; isLoading: boolean; login: (input: Credentials) => Promise<void>; register: (input: Registration) => Promise<void>; logout: () => void }
const AuthContext = createContext<AuthState | undefined>(undefined)
const tokenKey = 'splitstream_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const restoreSession = useCallback(async () => {
    if (!localStorage.getItem(tokenKey)) { setIsLoading(false); return }
    try { setUser(await getCurrentUser()) } catch { localStorage.removeItem(tokenKey) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { void restoreSession() }, [restoreSession])
  const signIn = useCallback(async (input: Credentials) => {
    const token = await loginUser(input)
    localStorage.setItem(tokenKey, token.access_token)
    setUser(await getCurrentUser())
  }, [])
  const register = useCallback(async (input: Registration) => { await registerUser(input); await signIn(input) }, [signIn])
  const value = useMemo(() => ({ user, isLoading, login: signIn, register, logout: () => { localStorage.removeItem(tokenKey); setUser(null) } }), [isLoading, register, signIn, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used within AuthProvider'); return context }
