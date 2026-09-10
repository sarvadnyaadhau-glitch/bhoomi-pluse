import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Card, Badge, Button } from '@/components/ui'
import {
  Settings, Bell, HelpCircle, LogOut, ChevronRight,
  Cpu, Landmark, Wrench, Wallet, Shield, Globe,
  Sprout, FileText, User as UserIcon, Tractor,
} from 'lucide-react'

export default function MoreScreen() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()

  const sections = [
    {
      title: 'Intelligence',
      items: [
        { icon: Landmark, label: 'Government Schemes', desc: 'Eligibility, documents, deadlines', badge: 'Coming soon' },
        { icon: Wrench, label: 'Services Marketplace', desc: 'Tractor, drone, labour, transport', badge: 'Coming soon' },
        { icon: Wallet, label: 'Farm Economics', desc: 'Profit, ROI, break-even analysis', badge: 'Coming soon' },
        { icon: Tractor, label: 'Machinery & Labour', desc: 'Equipment, fuel, worker tracking', badge: 'Coming soon' },
      ],
    },
    {
      title: 'System',
      items: [
        { icon: Cpu, label: 'Sensors & Devices', desc: 'Connect and manage IoT sensors', badge: 'Setup' },
        { icon: FileText, label: 'Farm Diary', desc: 'Voice & photo farm records', action: () => navigate('/farm') },
        { icon: Bell, label: 'Notifications', desc: 'Alerts and reminders', badge: '3 pending' },
        { icon: Globe, label: 'Language', desc: profile?.preferred_language === 'en' ? 'English' : profile?.preferred_language === 'hi' ? 'हिंदी' : 'मराठी' },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: UserIcon, label: 'Profile', desc: profile?.email || '' },
        { icon: Shield, label: 'Privacy & Data', desc: 'Consent, export, deletion' },
        { icon: HelpCircle, label: 'Help & Support', desc: 'FAQs, contact' },
        { icon: Settings, label: 'Settings', desc: 'Theme, offline mode, sync' },
      ],
    },
  ]

  return (
    <div className="px-4 pt-6 space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold text-[var(--text)]">More</h1>
        <p className="text-sm text-[var(--text-secondary)]">Additional tools and settings</p>
      </header>

      <Card className="p-5 bg-gradient-to-br from-[var(--brand)] to-[var(--brand-light)] border-0 text-white">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
            <Sprout size={28} className="text-[var(--brand-accent)]" />
          </div>
          <div>
            <p className="text-lg font-bold">{profile?.full_name || 'Farmer'}</p>
            <p className="text-sm text-white/70">{profile?.email}</p>
            <Badge className="bg-white/15 text-white mt-1 capitalize">{profile?.role || 'farmer'}</Badge>
          </div>
        </div>
      </Card>

      {sections.map((section) => (
        <div key={section.title}>
          <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2 px-1">{section.title}</h3>
          <Card className="divide-y divide-[var(--border)]">
            {section.items.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  onClick={'action' in item && item.action ? item.action : undefined}
                  className="w-full flex items-center gap-3 p-4 hover:bg-[var(--bg)] transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-500)]/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-[var(--color-primary-600)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text)]">{item.label}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{item.desc}</p>
                  </div>
                  {'badge' in item && item.badge && (
                    <Badge variant={item.badge === 'Coming soon' ? 'neutral' : 'brand'}>{item.badge}</Badge>
                  )}
                  <ChevronRight size={16} className="text-[var(--text-muted)]" />
                </button>
              )
            })}
          </Card>
        </div>
      ))}

      <Button variant="outline" fullWidth size="lg" onClick={signOut}>
        <LogOut size={18} /> Sign out
      </Button>

      <p className="text-center text-xs text-[var(--text-muted)] pb-4">
        SENSOTECH v0.1.0 — Farm Intelligence Platform
      </p>
    </div>
  )
}
