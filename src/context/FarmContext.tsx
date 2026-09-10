import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Farm } from '@/types'

interface FarmContextValue {
  farms: Farm[]
  activeFarm: Farm | null
  loading: boolean
  refresh: () => Promise<void>
  setActiveFarm: (farm: Farm) => void
  addFarm: (data: Partial<Farm>) => Promise<{ error: string | null }>
}

const FarmContext = createContext<FarmContextValue | undefined>(undefined)

export function FarmProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [farms, setFarms] = useState<Farm[]>([])
  const [activeFarm, setActiveFarmState] = useState<Farm | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      setFarms([])
      setActiveFarmState(null)
      setLoading(false)
      return
    }
    refresh()
  }, [session])

  async function refresh() {
    setLoading(true)
    const { data } = await supabase
      .from('farms')
      .select('*')
      .order('created_at', { ascending: true })

    const farmList = (data || []) as Farm[]
    setFarms(farmList)

    const stored = localStorage.getItem('sensotech_active_farm_id')
    const found = farmList.find((f) => f.id === stored)
    const target = found || farmList[0] || null
    setActiveFarmState(target)
    if (target) {
      localStorage.setItem('sensotech_active_farm_id', target.id)
    }
    setLoading(false)
  }

  function setActiveFarm(farm: Farm) {
    setActiveFarmState(farm)
    localStorage.setItem('sensotech_active_farm_id', farm.id)
  }

  async function addFarm(data: Partial<Farm>) {
    const { data: newFarm, error } = await supabase
      .from('farms')
      .insert(data)
      .select()
      .maybeSingle()

    if (error) return { error }
    if (newFarm) {
      await refresh()
      setActiveFarm(newFarm as Farm)
    }
    return { error: null }
  }

  return (
    <FarmContext.Provider value={{ farms, activeFarm, loading, refresh, setActiveFarm, addFarm }}>
      {children}
    </FarmContext.Provider>
  )
}

export function useFarm() {
  const ctx = useContext(FarmContext)
  if (!ctx) throw new Error('useFarm must be used within FarmProvider')
  return ctx
}
