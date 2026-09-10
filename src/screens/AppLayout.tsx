import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Home, MapPin, ScanLine, MessageCircle, Store, Newspaper, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/farm', label: 'My Farm', icon: MapPin },
  { to: '/scan', label: 'Scan', icon: ScanLine, highlight: true },
  { to: '/ask', label: 'Ask', icon: MessageCircle },
  { to: '/market', label: 'Market', icon: Store },
  { to: '/news', label: 'News', icon: Newspaper },
  { to: '/more', label: 'More', icon: Menu },
]

export default function AppLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <main key={location.pathname} className="flex-1 pb-20 max-w-md mx-auto w-full animate-fade-in">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-card)] border-t border-[var(--border)] shadow-[var(--shadow-lg)]">
        <div className="max-w-md mx-auto px-1 flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg transition-all min-w-[52px] relative',
                    isActive ? 'text-[var(--brand)]' : 'text-[var(--text-muted)]',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {item.highlight ? (
                      <>
                        <div className="absolute -top-5 w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-[var(--brand)]">
                          <Icon size={22} className="text-white" />
                        </div>
                        <span className={cn('text-[10px] font-semibold mt-6', isActive ? 'text-[var(--brand)]' : 'text-[var(--text-muted)]')}>
                          {item.label}
                        </span>
                      </>
                    ) : (
                      <>
                        <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                        <span className={cn('text-[10px] font-medium', isActive && 'font-semibold')}>{item.label}</span>
                      </>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
