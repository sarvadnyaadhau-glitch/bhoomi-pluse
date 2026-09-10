import { useState, useRef, useEffect } from 'react'
import { useFarm } from '@/context/FarmContext'
import { supabase } from '@/lib/supabase'
import { Card, Badge, Button, EmptyState, Spinner } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import type { ScanSession } from '@/types'
import {
  ScanLine, Camera, Upload, CheckCircle2,
  Image as ImageIcon, Microscope, X, History,
} from 'lucide-react'

export default function ScanScreen() {
  const { activeFarm } = useFarm()
  const [scans, setScans] = useState<ScanSession[]>([])
  const [loading, setLoading] = useState(true)
  const [showCapture, setShowCapture] = useState(false)
  const [view, setView] = useState<'main' | 'history'>('main')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (activeFarm) loadScans() }, [activeFarm])

  async function loadScans() {
    if (!activeFarm) return
    setLoading(true)
    const { data } = await supabase.from('scan_sessions').select('*').eq('farm_id', activeFarm.id).order('created_at', { ascending: false }).limit(20)
    setScans((data || []) as ScanSession[])
    setLoading(false)
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !activeFarm) return

    setShowCapture(false)
    setLoading(true)

    const ext = file.name.split('.').pop()
    const fileName = `scan-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('scans')
      .upload(fileName, file)

    let imageUrl: string | null = null
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('scans').getPublicUrl(fileName)
      imageUrl = urlData.publicUrl
    }

    await supabase.from('scan_sessions').insert({
      farm_id: activeFarm.id,
      scan_type: 'crop',
      image_url: imageUrl,
      status: 'completed',
      diagnosis: 'Image uploaded and saved to farm memory. AI crop disease analysis requires a configured Crop Doctor model — this integration point is ready for a specialized AI agent to connect.',
      confidence: 'low',
      evidence: { note: 'No AI model configured — image saved for manual review.' },
    })

    loadScans()
  }

  if (!activeFarm) {
    return (
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-extrabold text-[var(--text)] mb-4">Scan</h1>
        <EmptyState icon={<ScanLine size={48} />} title="No farm selected" description="Create a farm first to use the crop scanner." />
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 space-y-4">
      <header>
        <h1 className="text-2xl font-extrabold text-[var(--text)]">Scan</h1>
        <p className="text-sm text-[var(--text-secondary)]">Crop Doctor — check your crop health</p>
      </header>

      {view === 'main' && (
        <>
          <Card className="p-6 text-center bg-gradient-to-br from-[var(--brand)] to-[var(--brand-light)] border-0 text-white">
            <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4">
              <Microscope size={32} className="text-white" />
            </div>
            <h2 className="text-lg font-bold mb-1">Crop Doctor</h2>
            <p className="text-sm text-white/70 mb-4">Take a photo of your crop to check for diseases, pests, or nutrient issues.</p>
            <Button variant="secondary" size="lg" fullWidth onClick={() => setShowCapture(true)}>
              <Camera size={20} /> Scan Crop
            </Button>
          </Card>

          {scans.length > 0 && (
            <>
              <div className="flex items-center justify-between px-1">
                <h3 className="text-base font-bold text-[var(--text)]">Recent Scans</h3>
                <button onClick={() => setView('history')} className="text-xs text-[var(--brand)] font-semibold flex items-center gap-0.5">
                  View all <History size={14} />
                </button>
              </div>
              {scans.slice(0, 3).map((scan) => (
                <ScanCard key={scan.id} scan={scan} />
              ))}
            </>
          )}

          <Card className="p-4">
            <h3 className="font-semibold text-sm text-[var(--text)] mb-2">Scan Tips</h3>
            <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-[var(--color-success-500)] mt-0.5 flex-shrink-0" /> Take photos in good daylight</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-[var(--color-success-500)] mt-0.5 flex-shrink-0" /> Focus on the affected area</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-[var(--color-success-500)] mt-0.5 flex-shrink-0" /> Capture both close-up and wide angle</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-[var(--color-success-500)] mt-0.5 flex-shrink-0" /> Include leaves, stem, and fruit</li>
            </ul>
          </Card>
        </>
      )}

      {view === 'history' && (
        <>
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => setView('main')} className="text-sm text-[var(--brand)] font-semibold">Back</button>
            <h2 className="text-lg font-bold text-[var(--text)]">Scan History</h2>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : scans.length === 0 ? (
            <EmptyState icon={<ImageIcon size={40} />} title="No scans yet" description="Your crop scans will appear here." />
          ) : (
            <div className="space-y-3">
              {scans.map((scan) => <ScanCard key={scan.id} scan={scan} />)}
            </div>
          )}
        </>
      )}

      {showCapture && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" onClick={() => setShowCapture(false)}>
          <div className="bg-[var(--bg-card)] rounded-t-3xl p-6 w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[var(--text)]">Capture Photo</h3>
              <button onClick={() => setShowCapture(false)}><X size={20} className="text-[var(--text-muted)]" /></button>
            </div>
            <div className="space-y-2">
              <Button fullWidth size="lg" onClick={() => fileRef.current?.click()}>
                <Upload size={20} /> Upload Photo
              </Button>
              <p className="text-xs text-center text-[var(--text-muted)]">Choose a crop photo from your device</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
          </div>
        </div>
      )}
    </div>
  )
}

function ScanCard({ scan }: { scan: ScanSession }) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        {scan.image_url ? (
          <img src={scan.image_url} alt="scan" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-[var(--bg)] flex items-center justify-center flex-shrink-0">
            <ImageIcon size={24} className="text-[var(--text-muted)]" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="brand">{scan.scan_type}</Badge>
            {scan.confidence && (
              <Badge variant={scan.confidence === 'high' ? 'success' : scan.confidence === 'medium' ? 'info' : 'warning'}>
                {scan.confidence} confidence
              </Badge>
            )}
          </div>
          <p className="text-sm text-[var(--text)]">{scan.diagnosis || 'Analysis pending'}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{formatDate(scan.created_at)}</p>
        </div>
      </div>
    </Card>
  )
}
