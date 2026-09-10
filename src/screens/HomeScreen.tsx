import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useFarm } from '@/context/FarmContext'
import { supabase } from '@/lib/supabase'
import { Card, Badge, Button, EmptyState, Spinner } from '@/components/ui'
import { getGreeting, timeAgo, cropAgeDays } from '@/lib/utils'
import type { Task, Recommendation, SensorDevice, SensorReading, CropSeason, Field } from '@/types'
import {
  CloudRain, ScanLine, MessageCircle, Store, Sprout, Droplets,
  AlertTriangle, CheckCircle2, ChevronRight, MapPin, Thermometer,
  FlaskConical, Activity, Battery, Wifi, Plus,
} from 'lucide-react'

export default function HomeScreen() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { farms, activeFarm, loading: farmLoading, setActiveFarm } = useFarm()

  const [tasks, setTasks] = useState<Task[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [sensors, setSensors] = useState<SensorDevice[]>([])
  const [latestReading, setLatestReading] = useState<SensorReading | null>(null)
  const [activeCrop, setActiveCrop] = useState<{ season: CropSeason; field: Field } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeFarm) {
      setLoading(false)
      return
    }
    loadData()
  }, [activeFarm])

  async function loadData() {
    if (!activeFarm) return
    setLoading(true)

    const [tasksRes, recsRes, sensorsRes] = await Promise.all([
      supabase.from('tasks').select('*').eq('farm_id', activeFarm.id).eq('status', 'pending').order('due_date', { ascending: true }).limit(5),
      supabase.from('recommendations').select('*').eq('farm_id', activeFarm.id).eq('status', 'active').order('priority', { ascending: false }).limit(3),
      supabase.from('sensor_devices').select('*').eq('farm_id', activeFarm.id),
    ])

    setTasks((tasksRes.data || []) as Task[])
    setRecommendations((recsRes.data || []) as Recommendation[])
    setSensors((sensorsRes.data || []) as SensorDevice[])

    if (sensorsRes.data && sensorsRes.data.length > 0) {
      const deviceIds = sensorsRes.data.map((s) => s.id)
      const { data: reading } = await supabase
        .from('sensor_readings')
        .select('*')
        .in('device_id', deviceIds)
        .order('reading_timestamp', { ascending: false })
        .limit(1)
        .maybeSingle()
      setLatestReading(reading as SensorReading | null)
    } else {
      setLatestReading(null)
    }

    const { data: fields } = await supabase.from('fields').select('*').eq('farm_id', activeFarm.id)
    if (fields && fields.length > 0) {
      const fieldIds = fields.map((f) => f.id)
      const { data: seasons } = await supabase
        .from('crop_seasons')
        .select('*')
        .in('field_id', fieldIds)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (seasons) {
        const field = fields.find((f) => f.id === seasons.field_id)
        if (field) setActiveCrop({ season: seasons as CropSeason, field: field as Field })
      } else {
        setActiveCrop(null)
      }
    } else {
      setActiveCrop(null)
    }

    setLoading(false)
  }

  if (farmLoading) {
    return <div className="flex justify-center pt-20"><Spinner size="lg" /></div>
  }

  if (farms.length === 0) {
    return (
      <div className="px-4 pt-6">
        <header className="mb-6">
          <p className="text-sm text-[var(--text-secondary)]">{getGreeting()},</p>
          <h1 className="text-2xl font-extrabold text-[var(--text)]">{profile?.full_name || 'Farmer'}</h1>
        </header>
        <EmptyState
          icon={<Sprout size={48} />}
          title="Add your first farm"
          description="Create your farm to start receiving farm-specific intelligence, recommendations, and task reminders."
          action={<Button onClick={() => navigate('/farm')} size="lg">
            <Plus size={18} /> Create Farm
          </Button>}
        />
      </div>
    )
  }

  const hasSensor = sensors.length > 0
  const liveSensor = sensors.find((s) => s.status === 'live')

  return (
    <div className="px-4 pt-6 space-y-5">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">{getGreeting()},</p>
          <h1 className="text-2xl font-extrabold text-[var(--text)]">{profile?.full_name?.split(' ')[0] || 'Farmer'}</h1>
        </div>
        {farms.length > 1 && (
          <select
            value={activeFarm?.id || ''}
            onChange={(e) => {
              const farm = farms.find((f) => f.id === e.target.value)
              if (farm) setActiveFarm(farm)
            }}
            className="text-sm font-medium bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)]"
          >
            {farms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        )}
      </header>

      {/* Farm Status Card */}
      <Card className="p-5 bg-gradient-to-br from-[var(--brand)] to-[var(--brand-light)] border-0 text-white">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wide">Your Farm</p>
            <h2 className="text-xl font-bold">{activeFarm?.name}</h2>
            {activeFarm?.location_text && (
              <p className="text-white/60 text-sm flex items-center gap-1 mt-0.5">
                <MapPin size={12} /> {activeFarm.location_text}
              </p>
            )}
          </div>
          <div className="text-right">
            {activeCrop ? (
              <>
                <Badge variant="success" className="bg-white/15 text-white">{activeCrop.season.crop_name}</Badge>
                <p className="text-white/70 text-xs mt-1">{cropAgeDays(activeCrop.season.sowing_date)} days old</p>
              </>
            ) : (
              <Badge className="bg-white/15 text-white">No active crop</Badge>
            )}
          </div>
        </div>
        {activeCrop && activeCrop.field && (
          <p className="text-white/80 text-sm">Field: {activeCrop.field.name}</p>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <QuickAction icon={<ScanLine size={20} className="text-[var(--color-primary-600)]" />} label="Scan Crop" desc="Check crop health" onClick={() => navigate('/scan')} />
        <QuickAction icon={<MessageCircle size={20} className="text-[var(--color-secondary-600)]" />} label="Ask SENSOTECH" desc="Get farm advice" onClick={() => navigate('/ask')} />
        <QuickAction icon={<Store size={20} className="text-[var(--color-accent-600)]" />} label="Market" desc="Check prices" onClick={() => navigate('/market')} />
        <QuickAction icon={<Sprout size={20} className="text-[var(--color-primary-600)]" />} label="My Farm" desc="Farm details" onClick={() => navigate('/farm')} />
      </div>

      {loading ? (
        <Card className="p-6 flex justify-center"><Spinner /></Card>
      ) : (
        <>
          {/* Active Recommendations */}
          {recommendations.length > 0 && (
            <section>
              <h3 className="text-base font-bold text-[var(--text)] mb-3 px-1">Today's Actions</h3>
              <div className="space-y-2">
                {recommendations.map((rec) => (
                  <Card key={rec.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        rec.priority === 'urgent' ? 'bg-[var(--color-error-500)]/15' :
                        rec.priority === 'high' ? 'bg-[var(--color-warning-500)]/15' :
                        'bg-[var(--color-primary-500)]/15'
                      }`}>
                        {rec.recommendation_type === 'irrigation' ? <Droplets size={18} className="text-[var(--color-secondary-600)]" /> :
                         rec.recommendation_type === 'pest' || rec.recommendation_type === 'disease' ? <AlertTriangle size={18} className="text-[var(--color-warning-600)]" /> :
                         rec.recommendation_type === 'weather' ? <CloudRain size={18} className="text-[var(--color-secondary-600)]" /> :
                         <CheckCircle2 size={18} className="text-[var(--color-primary-600)]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[var(--text)]">{rec.action}</p>
                        {rec.reason && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{rec.reason}</p>}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={rec.confidence === 'high' ? 'success' : rec.confidence === 'medium' ? 'info' : 'warning'}>
                            {rec.confidence} confidence
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Sensor / Soil Intelligence */}
          <section>
            <h3 className="text-base font-bold text-[var(--text)] mb-3 px-1">Soil &amp; Sensor Intelligence</h3>
            {hasSensor && latestReading ? (
              <Card className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${liveSensor ? 'bg-[var(--color-success-500)] animate-[pulse_2s_infinite]' : 'bg-[var(--text-muted)]'}`} />
                    <span className="text-sm font-medium text-[var(--text)]">
                      {sensors[0]?.device_name || 'Sensor'}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">{timeAgo(latestReading.reading_timestamp)}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <SensorMetric icon={<FlaskConical size={16} />} label="Nitrogen" value={latestReading.nitrogen} unit="mg/kg" />
                  <SensorMetric icon={<FlaskConical size={16} />} label="Phosphorus" value={latestReading.phosphorus} unit="mg/kg" />
                  <SensorMetric icon={<FlaskConical size={16} />} label="Potassium" value={latestReading.potassium} unit="mg/kg" />
                  <SensorMetric icon={<Activity size={16} />} label="pH" value={latestReading.ph} unit="" />
                  <SensorMetric icon={<Activity size={16} />} label="EC" value={latestReading.ec} unit="dS/m" />
                  <SensorMetric icon={<Droplets size={16} />} label="Moisture" value={latestReading.soil_moisture} unit="%" />
                  <SensorMetric icon={<Thermometer size={16} />} label="Soil Temp" value={latestReading.soil_temperature} unit="°C" />
                  <SensorMetric icon={<Thermometer size={16} />} label="Air Temp" value={latestReading.air_temperature} unit="°C" />
                  <SensorMetric icon={<Droplets size={16} />} label="Humidity" value={latestReading.air_humidity} unit="%" />
                </div>
                <div className="flex items-center gap-4 pt-2 border-t border-[var(--border)]">
                  {sensors[0]?.battery_level != null && (
                    <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                      <Battery size={14} /> {sensors[0].battery_level}%
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                    <Wifi size={14} /> {sensors[0]?.status || 'offline'}
                  </span>
                </div>
              </Card>
            ) : hasSensor ? (
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--text-muted)]" />
                  <span className="text-sm font-medium text-[var(--text)]">Sensor connected</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">No readings available yet. Sensor data will appear here once readings are received.</p>
              </Card>
            ) : (
              <Card className="p-5 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-500)]/10 flex items-center justify-center mx-auto mb-3">
                  <Sprout size={24} className="text-[var(--color-primary-600)]" />
                </div>
                <p className="text-sm font-medium text-[var(--text)] mb-1">Soil Intelligence Available</p>
                <p className="text-xs text-[var(--text-secondary)] mb-3">
                  Your farm works without a sensor using satellite, weather, and farm history data.
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Connect a SENSOTECH sensor for live soil NPK, pH, moisture, and temperature data.
                </p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/more')}>
                  Learn more
                </Button>
              </Card>
            )}
          </section>

          {/* Upcoming Tasks */}
          {tasks.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-base font-bold text-[var(--text)]">Upcoming Tasks</h3>
                <button onClick={() => navigate('/farm')} className="text-xs text-[var(--brand)] font-semibold flex items-center gap-0.5">
                  View all <ChevronRight size={14} />
                </button>
              </div>
              <div className="space-y-2">
                {tasks.map((task) => (
                  <Card key={task.id} className="p-3 flex items-center gap-3">
                    <div className={`w-2 h-10 rounded-full ${
                      task.priority === 'urgent' ? 'bg-[var(--color-error-500)]' :
                      task.priority === 'high' ? 'bg-[var(--color-warning-500)]' :
                      'bg-[var(--color-primary-500)]'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[var(--text)] truncate">{task.title}</p>
                      {task.due_date && (
                        <p className="text-xs text-[var(--text-muted)]">
                          Due {new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      )}
                    </div>
                    <Badge variant={task.priority === 'urgent' ? 'error' : task.priority === 'high' ? 'warning' : 'neutral'}>
                      {task.task_type}
                    </Badge>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* No data state */}
          {recommendations.length === 0 && tasks.length === 0 && !loading && (
            <Card className="p-6 text-center">
              <CheckCircle2 size={32} className="text-[var(--color-success-500)] mx-auto mb-2" />
              <p className="text-sm font-medium text-[var(--text)]">All clear for now</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">No urgent actions or tasks. Use Scan or Ask SENSOTECH for insights.</p>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

function QuickAction({ icon, label, desc, onClick }: { icon: React.ReactNode; label: string; desc: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 flex flex-col items-start gap-2 hover:shadow-md hover:border-[var(--border-strong)] transition-all active:scale-[0.97] text-left"
    >
      <div className="w-10 h-10 rounded-xl bg-[var(--bg)] flex items-center justify-center">{icon}</div>
      <div>
        <p className="font-semibold text-sm text-[var(--text)]">{label}</p>
        <p className="text-xs text-[var(--text-muted)]">{desc}</p>
      </div>
    </button>
  )
}

function SensorMetric({ icon, label, value, unit }: { icon: React.ReactNode; label: string; value: number | null; unit: string }) {
  return (
    <div className="bg-[var(--bg)] rounded-xl p-2.5">
      <div className="flex items-center gap-1.5 text-[var(--text-muted)] mb-1">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-bold text-[var(--text)]">
        {value != null ? value : '—'}
        {value != null && unit && <span className="text-xs font-normal text-[var(--text-muted)] ml-0.5">{unit}</span>}
      </p>
    </div>
  )
}
