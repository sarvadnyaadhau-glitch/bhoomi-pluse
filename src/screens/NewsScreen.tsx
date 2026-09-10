import { useState } from 'react'
import { Card, Badge, EmptyState } from '@/components/ui'
import { useFarm } from '@/context/FarmContext'
import {
  Newspaper, Info, CloudRain, Wheat, TrendingUp, MapPin, Landmark,
} from 'lucide-react'

type NewsCategory = 'foryou' | 'government' | 'market' | 'crop' | 'weather' | 'local'

export default function NewsScreen() {
  const { activeFarm } = useFarm()
  const [category, setCategory] = useState<NewsCategory>('foryou')

  if (!activeFarm) {
    return (
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-extrabold text-[var(--text)] mb-4">News</h1>
        <EmptyState icon={<Newspaper size={48} />} title="No farm selected" description="Create a farm first to see relevant news." />
      </div>
    )
  }

  const categories: { id: NewsCategory; label: string }[] = [
    { id: 'foryou', label: 'For You' },
    { id: 'government', label: 'Government' },
    { id: 'market', label: 'Market' },
    { id: 'crop', label: 'Crop' },
    { id: 'weather', label: 'Weather' },
    { id: 'local', label: 'Local' },
  ]

  return (
    <div className="px-4 pt-6 space-y-4">
      <header>
        <h1 className="text-2xl font-extrabold text-[var(--text)]">News</h1>
        <p className="text-sm text-[var(--text-secondary)]">What matters for your farm</p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              category === cat.id ? 'bg-[var(--brand)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {category === 'foryou' && (
        <div className="space-y-3 animate-fade-in">
          <Card className="p-5 bg-gradient-to-br from-[var(--brand)] to-[var(--brand-light)] border-0 text-white">
            <p className="text-white/70 text-xs font-medium uppercase tracking-wide">Mere Liye Kya Badla?</p>
            <p className="text-lg font-bold mt-1">What changed for you?</p>
            <p className="text-sm text-white/80 mt-2">
              Personalized news based on your farm location, crops, and season will appear here once news sources are connected.
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-warning-500)]/15 flex items-center justify-center flex-shrink-0">
                <Info size={20} className="text-[var(--color-warning-600)]" />
              </div>
              <div>
                <p className="font-semibold text-sm text-[var(--text)]">News sources not configured</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  SENSOTECH pulls news from official government sources, agricultural departments, and verified news providers.
                  Once connected, you'll see personalized updates about schemes, market changes, weather alerts, and pest warnings relevant to your farm.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {category === 'government' && (
        <div className="space-y-3 animate-fade-in">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Landmark size={18} className="text-[var(--color-primary-600)]" />
              <h3 className="font-bold text-sm text-[var(--text)]">Government Schemes & Notifications</h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-3">
              Government information must come from official sources. SENSOTECH tracks scheme launches, GR notifications, and deadline changes.
            </p>
            <div className="space-y-2">
              {['PM-Kisan Samman Nidhi', 'Crop Insurance Schemes', 'Sub-Mission on Agricultural Mechanization', 'Soil Health Card Scheme'].map((s) => (
                <div key={s} className="flex items-center justify-between p-3 bg-[var(--bg)] rounded-lg">
                  <span className="text-sm text-[var(--text)]">{s}</span>
                  <Badge variant="neutral">Check eligibility</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {category === 'market' && (
        <Card className="p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-[var(--color-secondary-600)]" />
            <h3 className="font-bold text-sm text-[var(--text)]">Market News</h3>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Market news — including MSP announcements, procurement updates, and price movements — will appear here once a news provider is configured.
          </p>
        </Card>
      )}

      {category === 'crop' && (
        <Card className="p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Wheat size={18} className="text-[var(--color-primary-600)]" />
            <h3 className="font-bold text-sm text-[var(--text)]">Crop News</h3>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Crop-specific news including pest alerts, disease outbreaks, and agronomic advisories will be personalized to your active crops.
          </p>
        </Card>
      )}

      {category === 'weather' && (
        <Card className="p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <CloudRain size={18} className="text-[var(--color-secondary-600)]" />
            <h3 className="font-bold text-sm text-[var(--text)]">Weather Alerts</h3>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Weather alerts — heavy rain, heat wave, storm warnings — will appear here once a weather provider integration is configured.
          </p>
        </Card>
      )}

      {category === 'local' && (
        <Card className="p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={18} className="text-[var(--color-primary-600)]" />
            <h3 className="font-bold text-sm text-[var(--text)]">Local Agriculture News</h3>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            District and village-level agricultural news, including local pest alerts, KVK advisories, and agriculture office notifications.
          </p>
        </Card>
      )}
    </div>
  )
}
