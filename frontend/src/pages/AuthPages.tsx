import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { apiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { Button, Field, Input, Logo } from '../components/ui'

const loginSchema = z.object({ email: z.email('Enter a valid email address'), password: z.string().min(1, 'Enter your password') })
const registerSchema = z.object({ name: z.string().trim().min(2, 'Use at least 2 characters'), email: z.email('Enter a valid email address'), password: z.string().min(8, 'Use at least 8 characters'), confirmPassword: z.string() }).refine((values) => values.password === values.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })
type LoginValues = z.infer<typeof loginSchema>
type RegisterValues = z.infer<typeof registerSchema>

function AuthFrame({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) { return <div className="min-h-screen bg-surface"><header className="mx-auto flex h-20 max-w-6xl items-center px-5"><Link to="/" className="flex items-center gap-2 text-sm text-muted hover:text-ink"><ArrowLeft className="size-4" />Back to home</Link><div className="mx-auto"><Logo /></div></header><main className="mx-auto flex max-w-md justify-center px-5 pb-14 pt-10"><div className="w-full rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8"><h1 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h1><p className="mt-2 text-sm leading-6 text-muted">{subtitle}</p>{children}</div></main></div> }

export function LoginPage() {
  const { user, login } = useAuth(); const navigate = useNavigate(); const location = useLocation(); const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })
  if (user) return <Navigate to="/dashboard" replace />
  const onSubmit = async (values: LoginValues) => { setServerError(''); try { await login(values); navigate(location.state?.from?.pathname ?? '/dashboard', { replace: true }) } catch (error) { setServerError(apiError(error, 'We could not log you in. Please try again.')) } }
  return <AuthFrame title="Welcome back" subtitle="Log in to see your shared expenses."><form className="mt-7 space-y-5" onSubmit={handleSubmit(onSubmit)}><Field label="Email" error={errors.email?.message}><Input autoComplete="email" placeholder="you@example.com" {...register('email')} /></Field><Field label="Password" error={errors.password?.message}><Input type="password" autoComplete="current-password" placeholder="Your password" {...register('password')} /></Field>{serverError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{serverError}</p>}<div className="flex items-center justify-between text-sm"><label className="flex items-center gap-2 text-muted"><input type="checkbox" className="accent-accent" />Remember me</label><span className="text-muted">Forgot password?</span></div><Button type="submit" loading={isSubmitting} className="w-full">Log in</Button></form><p className="mt-6 text-center text-sm text-muted">New to SplitStream? <Link to="/register" className="font-medium text-accent hover:underline">Create an account</Link></p></AuthFrame>
}

export function RegisterPage() {
  const { user, register: createAccount } = useAuth(); const navigate = useNavigate(); const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) })
  if (user) return <Navigate to="/dashboard" replace />
  const onSubmit = async ({ confirmPassword: _confirmPassword, ...values }: RegisterValues) => { setServerError(''); try { await createAccount(values); navigate('/dashboard', { replace: true }) } catch (error) { setServerError(apiError(error, 'We could not create your account. Please try again.')) } }
  return <AuthFrame title="Start splitting smarter" subtitle="Create your account in under a minute."><form className="mt-7 space-y-4" onSubmit={handleSubmit(onSubmit)}><Field label="Name" error={errors.name?.message}><Input autoComplete="name" placeholder="Your name" {...register('name')} /></Field><Field label="Email" error={errors.email?.message}><Input autoComplete="email" placeholder="you@example.com" {...register('email')} /></Field><Field label="Password" error={errors.password?.message} hint="At least 8 characters"><Input type="password" autoComplete="new-password" placeholder="Create a password" {...register('password')} /></Field><Field label="Confirm password" error={errors.confirmPassword?.message}><Input type="password" autoComplete="new-password" placeholder="Repeat your password" {...register('confirmPassword')} /></Field>{serverError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{serverError}</p>}<Button type="submit" loading={isSubmitting} className="mt-2 w-full">Create account</Button></form><p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted"><CheckCircle2 className="size-3.5 text-accent" />Your password is stored securely.</p><p className="mt-5 text-center text-sm text-muted">Already have an account? <Link to="/login" className="font-medium text-accent hover:underline">Log in</Link></p></AuthFrame>
}
