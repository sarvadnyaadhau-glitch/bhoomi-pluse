import type { ReactNode, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  children: ReactNode
}

export function Button({ variant = 'primary', size = 'md', fullWidth = false, className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none',
        size === 'sm' && 'px-3 py-2 text-sm',
        size === 'md' && 'px-4 py-2.5 text-sm',
        size === 'lg' && 'px-6 py-3.5 text-base',
        variant === 'primary' && 'bg-[var(--brand)] text-white hover:bg-[var(--brand-light)] shadow-[var(--shadow-brand)]',
        variant === 'secondary' && 'bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)]',
        variant === 'ghost' && 'text-[var(--text)] hover:bg-[var(--bg-card)]',
        variant === 'outline' && 'border border-[var(--border-strong)] text-[var(--text)] hover:bg-[var(--bg-card)]',
        variant === 'danger' && 'bg-[var(--color-error-500)] text-white hover:bg-[var(--color-error-600)]',
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function Card({ className, children, onClick }: { className?: string; children: ReactNode; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-sm)] transition-all',
        onClick && 'cursor-pointer hover:shadow-[var(--shadow-md)] hover:border-[var(--border-strong)] active:scale-[0.99]',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Badge({ children, variant = 'neutral', className }: { children: ReactNode; variant?: 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'brand'; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
        variant === 'neutral' && 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]',
        variant === 'success' && 'bg-[var(--color-success-500)]/15 text-[var(--color-success-600)]',
        variant === 'warning' && 'bg-[var(--color-warning-500)]/15 text-[var(--color-warning-600)]',
        variant === 'error' && 'bg-[var(--color-error-500)]/15 text-[var(--color-error-600)]',
        variant === 'info' && 'bg-[var(--color-secondary-500)]/15 text-[var(--color-secondary-700)]',
        variant === 'brand' && 'bg-[var(--color-primary-500)]/15 text-[var(--color-primary-700)]',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div
      className={cn(
        'rounded-full border-2 border-[var(--border)] border-t-[var(--brand)] animate-[spin_0.8s_linear_infinite]',
        size === 'sm' && 'w-5 h-5',
        size === 'md' && 'w-8 h-8',
        size === 'lg' && 'w-12 h-12',
      )}
    />
  )
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-12 animate-fade-in">
      {icon && <div className="mb-4 text-[var(--text-muted)]">{icon}</div>}
      <h3 className="text-base font-semibold text-[var(--text)] mb-1">{title}</h3>
      {description && <p className="text-sm text-[var(--text-secondary)] max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function LoadingScreen({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-[var(--text-secondary)]">{label}</p>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-12 gap-3">
      <div className="w-12 h-12 rounded-full bg-[var(--color-error-500)]/15 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-error-500)]">
          <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <p className="text-sm text-[var(--text-secondary)] max-w-xs">{message}</p>
      {onRetry && <Button variant="outline" size="sm" onClick={onRetry}>Try again</Button>}
    </div>
  )
}
