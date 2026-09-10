import { useEffect, useState } from 'react'
import { useFarm } from '@/context/FarmContext'
import { supabase } from '@/lib/supabase'
import { Card, Badge, Button, EmptyState, Spinner, LoadingScreen } from '@/components/ui'
import { formatDate, cropAgeDays } from '@/lib/utils'
import type { Field, CropSeason, FarmEvent, Task, Expense, Farm } from '@/types'
import {
  Plus, MapPin, Sprout, Calendar, ClipboardList, Wallet,
  Trash2, Layers, Droplets,
} from 'lucide-react'

type Tab = 'overview' | 'fields' | 'memory' | 'tasks' | 'expenses'

export default function MyFarmScreen() {
  const { farms, activeFarm, loading, setActiveFarm, addFarm } = useFarm()
  const [tab, setTab] = useState<Tab>('overview')
  const [showAddFarm, setShowAddFarm] = useState(false)

  if (loading) return <LoadingScreen />

  if (farms.length === 0) {
    return (
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-extrabold text-[var(--text)] mb-2">My Farm</h1>
        <AddFarmForm onAdd={addFarm} />
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text)]">My Farm</h1>
          <p className="text-sm text-[var(--text-secondary)]">{activeFarm?.name}</p>
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

      <div className="flex gap-1 bg-[var(--bg-card)] rounded-xl p-1 border border-[var(--border)] overflow-x-auto">
        {([
          { id: 'overview', label: 'Overview' },
          { id: 'fields', label: 'Fields' },
          { id: 'memory', label: 'Memory' },
          { id: 'tasks', label: 'Tasks' },
          { id: 'expenses', label: 'Money' },
        ] as { id: Tab; label: string }[]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              tab === t.id ? 'bg-[var(--brand)] text-white' : 'text-[var(--text-secondary)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab farm={activeFarm!} />}
      {tab === 'fields' && <FieldsTab farmId={activeFarm!.id} />}
      {tab === 'memory' && <MemoryTab farmId={activeFarm!.id} />}
      {tab === 'tasks' && <TasksTab farmId={activeFarm!.id} />}
      {tab === 'expenses' && <ExpensesTab farmId={activeFarm!.id} />}

      {farms.length === 1 && (
        <button onClick={() => setShowAddFarm(true)} className="text-sm text-[var(--brand)] font-semibold flex items-center gap-1 justify-center py-2">
          <Plus size={16} /> Add another farm
        </button>
      )}

      {showAddFarm && <AddFarmForm onAdd={addFarm} onClose={() => setShowAddFarm(false)} />}
    </div>
  )
}

function OverviewTab({ farm }: { farm: Farm }) {
  const [fieldCount, setFieldCount] = useState(0)
  const [activeCrops, setActiveCrops] = useState<CropSeason[]>([])

  useEffect(() => {
    (async () => {
      const { data: fields } = await supabase.from('fields').select('id').eq('farm_id', farm.id)
      setFieldCount(fields?.length || 0)
      if (fields && fields.length > 0) {
        const { data: crops } = await supabase
          .from('crop_seasons')
          .select('*')
          .in('field_id', (fields as { id: string }[]).map((f) => f.id))
          .eq('status', 'active')
        setActiveCrops((crops || []) as CropSeason[])
      }
    })()
  }, [farm.id])

  return (
    <div className="space-y-3 animate-fade-in">
      <Card className="p-5">
        <div className="grid grid-cols-2 gap-4">
          <InfoItem icon={<Layers size={18} />} label="Total Fields" value={fieldCount.toString()} />
          <InfoItem icon={<MapPin size={18} />} label="Area" value={farm.area_acres ? `${farm.area_acres} acres` : 'Not set'} />
          <InfoItem icon={<Sprout size={18} />} label="Soil Type" value={farm.soil_type || 'Not set'} />
          <InfoItem icon={<Droplets size={18} />} label="Irrigation" value={farm.irrigation_type || 'Not set'} />
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-bold text-sm text-[var(--text)] mb-3">Active Crops</h3>
        {activeCrops.length > 0 ? (
          <div className="space-y-2">
            {activeCrops.map((crop) => (
              <div key={crop.id} className="flex items-center justify-between p-3 bg-[var(--bg)] rounded-xl">
                <div>
                  <p className="font-medium text-sm text-[var(--text)]">{crop.crop_name}</p>
                  {crop.variety && <p className="text-xs text-[var(--text-muted)]">{crop.variety}</p>}
                </div>
                <div className="text-right">
                  <Badge variant="success">{cropAgeDays(crop.sowing_date)} days</Badge>
                  {crop.sowing_date && <p className="text-xs text-[var(--text-muted)] mt-1">Sown {formatDate(crop.sowing_date)}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)] text-center py-2">No active crops. Add a field and crop to get started.</p>
        )}
      </Card>
    </div>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[var(--text-muted)] mb-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-sm font-semibold text-[var(--text)]">{value}</p>
    </div>
  )
}

function FieldsTab({ farmId }: { farmId: string }) {
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => { loadFields() }, [farmId])

  async function loadFields() {
    setLoading(true)
    const { data } = await supabase.from('fields').select('*').eq('farm_id', farmId).order('created_at')
    setFields((data || []) as Field[])
    setLoading(false)
  }

  async function addField(name: string, area: string) {
    await supabase.from('fields').insert({ farm_id: farmId, name, area_acres: area ? parseFloat(area) : null })
    setShowAdd(false)
    loadFields()
  }

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>

  return (
    <div className="space-y-3 animate-fade-in">
      {fields.length === 0 && !showAdd && (
        <EmptyState
          icon={<Layers size={40} />}
          title="No fields yet"
          description="Add fields to your farm to track crops, sensors, and activities."
          action={<Button size="sm" onClick={() => setShowAdd(true)}><Plus size={16} /> Add field</Button>}
        />
      )}

      {fields.map((field) => (
        <FieldCard key={field.id} field={field} onDeleted={loadFields} />
      ))}

      {showAdd && <InlineForm title="Add Field" placeholder="Field name" secondPlaceholder="Area (acres)" onSubmit={addField} onCancel={() => setShowAdd(false)} />}

      {fields.length > 0 && !showAdd && (
        <Button variant="outline" fullWidth onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add field
        </Button>
      )}
    </div>
  )
}

function FieldCard({ field, onDeleted }: { field: Field; onDeleted: () => void }) {
  const [crop, setCrop] = useState<CropSeason | null>(null)

  useEffect(() => {
    supabase.from('crop_seasons').select('*').eq('field_id', field.id).eq('status', 'active').order('created_at', { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => setCrop(data as CropSeason | null))
  }, [field.id])

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold text-sm text-[var(--text)]">{field.name}</p>
          {field.area_acres && <p className="text-xs text-[var(--text-muted)]">{field.area_acres} acres</p>}
        </div>
        <button onClick={async () => { await supabase.from('fields').delete().eq('id', field.id); onDeleted() }} className="text-[var(--text-muted)] hover:text-[var(--color-error-500)]">
          <Trash2 size={16} />
        </button>
      </div>
      {crop ? (
        <div className="mt-3 p-2.5 bg-[var(--bg)] rounded-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[var(--text)]">{crop.crop_name}</p>
            <p className="text-[10px] text-[var(--text-muted)]">{cropAgeDays(crop.sowing_date)} days old</p>
          </div>
          <Badge variant="success">Active</Badge>
        </div>
      ) : (
        <p className="text-xs text-[var(--text-muted)] mt-2">No active crop</p>
      )}
    </Card>
  )
}

function MemoryTab({ farmId }: { farmId: string }) {
  const [events, setEvents] = useState<FarmEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => { loadEvents() }, [farmId])

  async function loadEvents() {
    setLoading(true)
    const { data } = await supabase.from('farm_events').select('*').eq('farm_id', farmId).order('event_date', { ascending: false }).limit(20)
    setEvents((data || []) as FarmEvent[])
    setLoading(false)
  }

  async function addEvent(type: string, desc: string) {
    await supabase.from('farm_events').insert({ farm_id: farmId, event_type: type, description: desc })
    setShowAdd(false)
    loadEvents()
  }

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>

  return (
    <div className="space-y-3 animate-fade-in">
      <p className="text-sm text-[var(--text-secondary)]">Farm memory stores all important events and activities.</p>
      {events.length === 0 && !showAdd && (
        <EmptyState
          icon={<ClipboardList size={40} />}
          title="No farm records yet"
          description="Log activities like irrigation, fertilizer, spray, or observations to build your farm memory."
          action={<Button size="sm" onClick={() => setShowAdd(true)}><Plus size={16} /> Add record</Button>}
        />
      )}

      {events.map((event) => (
        <Card key={event.id} className="p-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-500)]/15 flex items-center justify-center flex-shrink-0">
            <Calendar size={16} className="text-[var(--color-primary-600)]" />
          </div>
          <div className="flex-1">
            <Badge variant="brand" className="mb-1">{event.event_type}</Badge>
            <p className="text-sm text-[var(--text)]">{event.description}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{formatDate(event.event_date)}</p>
          </div>
        </Card>
      ))}

      {showAdd && <EventForm onAdd={addEvent} onCancel={() => setShowAdd(false)} />}

      {events.length > 0 && !showAdd && (
        <Button variant="outline" fullWidth onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add record
        </Button>
      )}
    </div>
  )
}

function TasksTab({ farmId }: { farmId: string }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => { loadTasks() }, [farmId])

  async function loadTasks() {
    setLoading(true)
    const { data } = await supabase.from('tasks').select('*').eq('farm_id', farmId).order('due_date', { ascending: true })
    setTasks((data || []) as Task[])
    setLoading(false)
  }

  async function addTask(title: string, type: string, priority: string, due: string) {
    await supabase.from('tasks').insert({ farm_id: farmId, title, task_type: type, priority, due_date: due || null })
    setShowAdd(false)
    loadTasks()
  }

  async function toggleTask(task: Task) {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    await supabase.from('tasks').update({ status: newStatus, completed_at: newStatus === 'completed' ? new Date().toISOString() : null }).eq('id', task.id)
    loadTasks()
  }

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>

  return (
    <div className="space-y-3 animate-fade-in">
      {tasks.length === 0 && !showAdd && (
        <EmptyState
          icon={<ClipboardList size={40} />}
          title="No tasks yet"
          description="Create tasks for irrigation, fertilizer, spraying, scouting, or harvesting."
          action={<Button size="sm" onClick={() => setShowAdd(true)}><Plus size={16} /> Add task</Button>}
        />
      )}

      {tasks.map((task) => (
        <Card key={task.id} className="p-3 flex items-center gap-3">
          <button
            onClick={() => toggleTask(task)}
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              task.status === 'completed' ? 'bg-[var(--color-success-500)] border-[var(--color-success-500)]' : 'border-[var(--border-strong)]'
            }`}
          >
            {task.status === 'completed' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
          </button>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text)]'}`}>{task.title}</p>
            {task.due_date && <p className="text-xs text-[var(--text-muted)]">Due {formatDate(task.due_date)}</p>}
          </div>
          <Badge variant={task.priority === 'urgent' ? 'error' : task.priority === 'high' ? 'warning' : 'neutral'}>
            {task.priority}
          </Badge>
        </Card>
      ))}

      {showAdd && <TaskForm onAdd={addTask} onCancel={() => setShowAdd(false)} />}

      {tasks.length > 0 && !showAdd && (
        <Button variant="outline" fullWidth onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add task
        </Button>
      )}
    </div>
  )
}

function ExpensesTab({ farmId }: { farmId: string }) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [total, setTotal] = useState(0)

  useEffect(() => { loadExpenses() }, [farmId])

  async function loadExpenses() {
    setLoading(true)
    const { data } = await supabase.from('expenses').select('*').eq('farm_id', farmId).order('expense_date', { ascending: false })
    const list = (data || []) as Expense[]
    setExpenses(list)
    setTotal(list.reduce((sum, e) => sum + e.amount, 0))
    setLoading(false)
  }

  async function addExpense(category: string, desc: string, amount: string) {
    await supabase.from('expenses').insert({ farm_id: farmId, category, description: desc, amount: parseFloat(amount) })
    setShowAdd(false)
    loadExpenses()
  }

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>

  return (
    <div className="space-y-3 animate-fade-in">
      <Card className="p-5 bg-gradient-to-br from-[var(--brand)] to-[var(--brand-light)] border-0 text-white">
        <p className="text-white/70 text-xs font-medium uppercase tracking-wide">Total Expenses</p>
        <p className="text-3xl font-extrabold mt-1">₹{total.toLocaleString('en-IN')}</p>
        <p className="text-white/60 text-xs mt-1">{expenses.length} transactions</p>
      </Card>

      {expenses.length === 0 && !showAdd && (
        <EmptyState
          icon={<Wallet size={40} />}
          title="No expenses tracked"
          description="Track input costs, labour, machinery, and other farm expenses."
          action={<Button size="sm" onClick={() => setShowAdd(true)}><Plus size={16} /> Add expense</Button>}
        />
      )}

      {expenses.map((exp) => (
        <Card key={exp.id} className="p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-accent-500)]/15 flex items-center justify-center flex-shrink-0">
            <Wallet size={16} className="text-[var(--color-accent-600)]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--text)]">{exp.description}</p>
            <p className="text-xs text-[var(--text-muted)]">{exp.category} · {formatDate(exp.expense_date)}</p>
          </div>
          <p className="text-sm font-bold text-[var(--text)]">₹{exp.amount.toLocaleString('en-IN')}</p>
        </Card>
      ))}

      {showAdd && <ExpenseForm onAdd={addExpense} onCancel={() => setShowAdd(false)} />}

      {expenses.length > 0 && !showAdd && (
        <Button variant="outline" fullWidth onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add expense
        </Button>
      )}
    </div>
  )
}

// --- Forms ---

const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10 transition-all'

function AddFarmForm({ onAdd, onClose }: { onAdd: (data: Partial<Farm>) => Promise<{ error: string | null }>; onClose?: () => void }) {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [area, setArea] = useState('')
  const [soilType, setSoilType] = useState('')
  const [irrigation, setIrrigation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!name.trim()) { setError('Farm name is required'); return }
    setLoading(true)
    const { error } = await onAdd({
      name,
      location_text: location,
      area_acres: area ? parseFloat(area) : null,
      soil_type: soilType || null,
      irrigation_type: irrigation || null,
    })
    if (error) setError(error)
    setLoading(false)
  }

  return (
    <Card className="p-5 space-y-3 animate-slide-up">
      <h3 className="font-bold text-[var(--text)]">Add Farm</h3>
      <FormInput label="Farm name *" value={name} onChange={setName} placeholder="e.g. Adhau Farm" />
      <FormInput label="Location" value={location} onChange={setLocation} placeholder="Village, District, State" />
      <FormInput label="Area (acres)" value={area} onChange={setArea} placeholder="e.g. 5" type="number" />
      <FormInput label="Soil type" value={soilType} onChange={setSoilType} placeholder="e.g. Black, Red, Loamy" />
      <FormInput label="Irrigation type" value={irrigation} onChange={setIrrigation} placeholder="e.g. Drip, Flood, Rainfed" />
      {error && <p className="text-sm text-[var(--color-error-600)]">{error}</p>}
      <div className="flex gap-2">
        {onClose && <Button variant="outline" fullWidth onClick={onClose}>Cancel</Button>}
        <Button fullWidth onClick={submit} disabled={loading}>{loading ? 'Adding...' : 'Add Farm'}</Button>
      </div>
    </Card>
  )
}

function InlineForm({ title, placeholder, secondPlaceholder, onSubmit, onCancel }: {
  title: string; placeholder: string; secondPlaceholder?: string;
  onSubmit: (v1: string, v2: string) => void; onCancel: () => void
}) {
  const [v1, setV1] = useState('')
  const [v2, setV2] = useState('')
  return (
    <Card className="p-4 space-y-3 animate-slide-up">
      <h3 className="font-semibold text-sm text-[var(--text)]">{title}</h3>
      <input className={inputClass} value={v1} onChange={(e) => setV1(e.target.value)} placeholder={placeholder} />
      {secondPlaceholder && <input className={inputClass} value={v2} onChange={(e) => setV2(e.target.value)} placeholder={secondPlaceholder} type="number" />}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={() => v1 && onSubmit(v1, v2)}>Add</Button>
      </div>
    </Card>
  )
}

function EventForm({ onAdd, onCancel }: { onAdd: (type: string, desc: string) => void; onCancel: () => void }) {
  const [type, setType] = useState('observation')
  const [desc, setDesc] = useState('')
  const types = ['observation', 'irrigation', 'fertilizer', 'spray', 'sowing', 'harvest', 'pest', 'weather', 'other']
  return (
    <Card className="p-4 space-y-3 animate-slide-up">
      <h3 className="font-semibold text-sm text-[var(--text)]">Add Farm Record</h3>
      <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
        {types.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
      </select>
      <textarea className={inputClass} rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What happened?" />
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={() => desc && onAdd(type, desc)}>Save</Button>
      </div>
    </Card>
  )
}

function TaskForm({ onAdd, onCancel }: { onAdd: (title: string, type: string, priority: string, due: string) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('general')
  const [priority, setPriority] = useState('medium')
  const [due, setDue] = useState('')
  const types = ['general', 'irrigation', 'fertilizer', 'spray', 'scouting', 'harvest', 'selling', 'documentation']
  const priorities = ['low', 'medium', 'high', 'urgent']
  return (
    <Card className="p-4 space-y-3 animate-slide-up">
      <h3 className="font-semibold text-sm text-[var(--text)]">Add Task</h3>
      <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
      <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
        {types.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <select className={inputClass} value={priority} onChange={(e) => setPriority(e.target.value)}>
        {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
      <input className={inputClass} type="date" value={due} onChange={(e) => setDue(e.target.value)} />
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={() => title && onAdd(title, type, priority, due)}>Add</Button>
      </div>
    </Card>
  )
}

function ExpenseForm({ onAdd, onCancel }: { onAdd: (cat: string, desc: string, amount: string) => void; onCancel: () => void }) {
  const [cat, setCat] = useState('input')
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const cats = ['input', 'labour', 'machinery', 'irrigation', 'transport', 'storage', 'seed', 'pesticide', 'fertilizer', 'other']
  return (
    <Card className="p-4 space-y-3 animate-slide-up">
      <h3 className="font-semibold text-sm text-[var(--text)]">Add Expense</h3>
      <select className={inputClass} value={cat} onChange={(e) => setCat(e.target.value)}>
        {cats.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
      </select>
      <input className={inputClass} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" />
      <input className={inputClass} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (₹)" />
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={() => desc && amount && onAdd(cat, desc, amount)}>Save</Button>
      </div>
    </Card>
  )
}

function FormInput({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">{label}</label>
      <input className={inputClass} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}
