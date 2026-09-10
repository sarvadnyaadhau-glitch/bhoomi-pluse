import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui'
import { Sprout, Mail, Lock, User as UserIcon } from 'lucide-react'

export default function AuthScreen() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await signUp(email, password, fullName)
      if (error) setError(error)
    } else {
      const { error } = await signIn(email, password)
      if (error) setError(error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[var(--brand)] to-[var(--brand-light)]">
      <div className="flex-1 flex flex-col justify-center px-6 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
            <Sprout size={28} className="text-[var(--brand-accent)]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">SENSOTECH</h1>
            <p className="text-white/70 text-sm">Farm Intelligence Platform</p>
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] rounded-t-3xl px-6 pt-8 pb-8 flex-1 shadow-2xl">
        <h2 className="text-xl font-bold text-[var(--text)] mb-1">
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          {mode === 'signin' ? 'Sign in to manage your farm' : 'Start your farm intelligence journey'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Full name</label>
              <div className="relative">
                <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/15 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="farmer@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/15 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/15 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="bg-[var(--color-error-500)]/10 border border-[var(--color-error-500)]/20 rounded-xl px-4 py-3">
              <p className="text-sm text-[var(--color-error-600)]">{error}</p>
            </div>
          )}

          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null) }}
            className="text-sm text-[var(--text-secondary)]"
          >
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <span className="text-[var(--brand)] font-semibold">
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </span>
          </button>
        </div>

        <p className="mt-8 text-xs text-center text-[var(--text-muted)]">
          By continuing, you agree to SENSOTECH's terms and privacy policy.
        </p>
      </div>
    </div>
  )
}
