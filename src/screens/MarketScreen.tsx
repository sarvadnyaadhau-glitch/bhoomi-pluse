import { Card, Badge, EmptyState } from '@/components/ui'
import { useFarm } from '@/context/FarmContext'
import { Store, TrendingUp, Calendar, MapPin, Info, Wheat } from 'lucide-react'

export default function MarketScreen() {
  const { activeFarm } = useFarm()

  if (!activeFarm) {
    return (
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-extrabold text-[var(--text)] mb-4">Market</h1>
        <EmptyState icon={<Store size={48} />} title="No farm selected" description="Create a farm first to see market information." />
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 space-y-4">
      <header>
        <h1 className="text-2xl font-extrabold text-[var(--text)]">Market</h1>
        <p className="text-sm text-[var(--text-secondary)]">Prices, trends, and selling intelligence</p>
      </header>

      <Card className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-warning-500)]/15 flex items-center justify-center flex-shrink-0">
            <Info size={20} className="text-[var(--color-warning-600)]" />
          </div>
          <div>
            <p className="font-semibold text-sm text-[var(--text)]">Market data provider not connected</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Real-time mandi prices require a market data integration (e.g. eNAM, Agmarknet).
              Once configured, you'll see nearby mandi prices, trends, and sell-now-vs-wait analysis.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-bold text-sm text-[var(--text)] mb-3">Selling Decision Framework</h3>
        <div className="space-y-2">
          <DecisionRow icon={<TrendingUp size={16} className="text-[var(--color-success-500)]" />} title="Sell Now" condition="Price above 30-day average + urgent cash need" />
          <DecisionRow icon={<Calendar size={16} className="text-[var(--color-secondary-600)]" />} title="Wait" condition="Price below average + storage available + no spoilage risk" />
          <DecisionRow icon={<Store size={16} className="text-[var(--color-accent-600)]" />} title="Store & Sell" condition="Storage cost less than expected price increase" />
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Wheat size={18} className="text-[var(--color-primary-600)]" />
          <h3 className="font-bold text-sm text-[var(--text)]">MSP Information</h3>
        </div>
        <p className="text-xs text-[var(--text-secondary)]">
          Minimum Support Prices are announced by the Government of India before each cropping season.
          MSP data requires an official government data source integration.
          Once connected, you'll see crop-wise MSP rates and how they compare to current market prices.
        </p>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={18} className="text-[var(--color-secondary-600)]" />
          <h3 className="font-bold text-sm text-[var(--text)]">Nearby Market Services</h3>
        </div>
        <div className="space-y-2">
          {['Mandi prices', 'Buyer network', 'Warehouse & storage', 'Transport cost calculator', 'FPO connections'].map((s) => (
            <div key={s} className="flex items-center justify-between p-2.5 bg-[var(--bg)] rounded-lg">
              <span className="text-sm text-[var(--text)]">{s}</span>
              <Badge variant="neutral">Coming soon</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-bold text-sm text-[var(--text)] mb-2">Net Realization Calculator</h3>
        <p className="text-xs text-[var(--text-secondary)] mb-3">
          Understand your actual earnings after deducting transport, storage, and commission costs.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-[var(--bg)] rounded-xl">
            <p className="text-xs text-[var(--text-muted)]">Gross price</p>
            <p className="text-lg font-bold text-[var(--text)]">₹—/quintal</p>
          </div>
          <div className="p-3 bg-[var(--bg)] rounded-xl">
            <p className="text-xs text-[var(--text-muted)]">Net realization</p>
            <p className="text-lg font-bold text-[var(--text)]">₹—/quintal</p>
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          Requires market price + transport cost data to calculate.
        </p>
      </Card>
    </div>
  )
}

function DecisionRow({ icon, title, condition }: { icon: React.ReactNode; title: string; condition: string }) {
  return (
    <div className="flex items-start gap-2 p-2.5 bg-[var(--bg)] rounded-lg">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div>
        <p className="text-sm font-medium text-[var(--text)]">{title}</p>
        <p className="text-xs text-[var(--text-secondary)]">{condition}</p>
      </div>
    </div>
  )
}
