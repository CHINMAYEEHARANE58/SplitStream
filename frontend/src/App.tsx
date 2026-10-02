import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { AppLayout } from './components/AppLayout'
import { LoginPage, RegisterPage } from './pages/AuthPages'
import { DashboardPage, PlaceholderPage } from './pages/AppPages'
import { LandingPage } from './pages/LandingPage'

const queryClient = new QueryClient()
function ProtectedLayout() { const { user, isLoading } = useAuth(); const location = useLocation(); if (isLoading) return <div className="grid min-h-screen place-items-center bg-surface"><div className="h-5 w-36 animate-pulse rounded bg-line" /></div>; if (!user) return <Navigate to="/login" replace state={{ from: location }} />; return <AppLayout><Outlet /></AppLayout> }
export default function App() { return <QueryClientProvider client={queryClient}><AuthProvider><BrowserRouter><Routes><Route path="/" element={<LandingPage />} /><Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} /><Route element={<ProtectedLayout />}><Route path="/dashboard" element={<DashboardPage />} /><Route path="/groups" element={<PlaceholderPage page="groups" />} /><Route path="/activity" element={<PlaceholderPage page="activity" />} /><Route path="/analytics" element={<PlaceholderPage page="analytics" />} /><Route path="/settlements" element={<PlaceholderPage page="settlements" />} /><Route path="/settings" element={<PlaceholderPage page="settings" />} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes></BrowserRouter></AuthProvider></QueryClientProvider> }
