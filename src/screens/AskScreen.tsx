import { useState, useRef, useEffect } from 'react'
import { useFarm } from '@/context/FarmContext'
import { supabase } from '@/lib/supabase'
import { Card, Button, EmptyState } from '@/components/ui'
import { MessageCircle, Send, Mic, Sparkles } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function AskScreen() {
  const { activeFarm } = useFarm()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: input, timestamp: new Date().toISOString() }
    setMessages((prev) => [...prev, userMsg])
    const query = input
    setInput('')
    setLoading(true)

    const response = await generateResponse(query, activeFarm?.name || 'your farm')

    const assistantMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: response, timestamp: new Date().toISOString() }
    setMessages((prev) => [...prev, assistantMsg])
    setLoading(false)

    if (activeFarm) {
      await supabase.from('farm_events').insert({
        farm_id: activeFarm.id,
        event_type: 'ai_query',
        description: `Q: ${query}`,
      })
    }
  }

  if (!activeFarm) {
    return (
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-extrabold text-[var(--text)] mb-4">Ask SENSOTECH</h1>
        <EmptyState icon={<MessageCircle size={48} />} title="No farm selected" description="Create a farm first to get personalized AI advice." />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen pb-20">
      <header className="px-4 pt-6 pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-light)] flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-[var(--text)]">Ask SENSOTECH</h1>
            <p className="text-xs text-[var(--text-secondary)]">Farm-aware AI assistant</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-500)]/10 flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={32} className="text-[var(--color-primary-600)]" />
            </div>
            <h2 className="text-lg font-bold text-[var(--text)] mb-1">Ask about your farm</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-xs mx-auto">
              Get advice on irrigation, pests, fertilizer, market, and more — tailored to your farm context.
            </p>
            <div className="space-y-2 text-left">
              {[
                'Should I irrigate today?',
                'What fertilizer should I use?',
                'How is my crop health?',
                'Should I sell now or wait?',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="w-full text-left px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-sm text-[var(--text)] hover:border-[var(--brand)] transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
              msg.role === 'user'
                ? 'bg-[var(--brand)] text-white rounded-br-sm'
                : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] rounded-bl-sm'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-[pulse_1.5s_infinite]" />
                <div className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-[pulse_1.5s_infinite_0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-[pulse_1.5s_infinite_0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--bg-card)]">
        <div className="flex items-end gap-2">
          <button
            onClick={() => setListening(!listening)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
              listening ? 'bg-[var(--color-error-500)]/15 text-[var(--color-error-500)] animate-[pulse_1.5s_infinite]' : 'bg-[var(--bg)] text-[var(--text-muted)]'
            }`}
          >
            <Mic size={18} />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Ask about your farm..."
            rows={1}
            className="flex-1 resize-none px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10 transition-all max-h-24"
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-[var(--brand)] text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 active:scale-95 transition-all"
          >
            <Send size={18} />
          </button>
        </div>
        {listening && (
          <p className="text-xs text-[var(--text-muted)] mt-2 text-center">Voice input is ready — speak your question</p>
        )}
      </div>
    </div>
  )
}

async function generateResponse(query: string, farmName: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 600))

  const lower = query.toLowerCase()

  if (lower.includes('irrigate') || lower.includes('water') || lower.includes('paani') || lower.includes('पानी')) {
    return `For ${farmName}, irrigation advice depends on several factors:\n\n• Soil moisture levels\n• Rain forecast for your area\n• Current crop stage\n• Recent irrigation history\n\nTo give you a specific recommendation, I need a weather provider integration configured. Without live weather data, I cannot reliably advise on irrigation timing.\n\nIn general: check if the top soil is dry to the touch before irrigating, and avoid irrigating if rain is forecast within 24-48 hours.`
  }

  if (lower.includes('fertilizer') || lower.includes('npk') || lower.includes('urea') || lower.includes('खत')) {
    return `Fertilizer recommendations for ${farmName} depend on:\n\n• Your crop type and growth stage\n• Soil NPK levels (from sensor or soil test)\n• Previous fertilizer applications\n• Weather conditions\n\nI can help you plan the right input once soil data is available. If you have a SENSOTECH sensor connected, I can use live NPK readings for a more precise recommendation.\n\nWould you like to log a fertilizer application to your farm memory?`
  }

  if (lower.includes('pest') || lower.includes('disease') || lower.includes('insect') || lower.includes('keeda')) {
    return `For pest and disease identification on ${farmName}, I recommend:\n\n1. Use the Scan feature to take a photo of the affected plant\n2. I can then analyze symptoms alongside weather and crop stage\n3. For uncertain cases, I'll recommend expert review\n\nEarly detection is key — check your fields regularly, especially after weather changes like heavy rain or high humidity.`
  }

  if (lower.includes('sell') || lower.includes('market') || lower.includes('price') || lower.includes('bechna') || lower.includes('mandi')) {
    return `For selling decisions on ${farmName}, consider:\n\n• Current market price vs. historical trends\n• Expected harvest date and quantity\n• Storage options available\n• Transport costs to nearby mandis\n\nMarket price data requires a configured market data provider. Once connected, I can show you nearby mandi prices, trends, and a sell-now-vs-wait analysis.\n\nWould you like to check the Market section for available information?`
  }

  if (lower.includes('health') || lower.includes('crop') || lower.includes('kaisa') || lower.includes('status')) {
    return `To assess crop health on ${farmName}, I combine:\n\n• Satellite vegetation indices (NDVI, etc.)\n• Sensor data (if connected)\n• Weather conditions\n• Photo scans\n• Farm history\n\nA comprehensive health assessment requires satellite and weather integrations to be configured. You can still use Scan to check individual plants, and your farm memory will build a picture over time.`
  }

  return `I understand you're asking about "${query}" for ${farmName}.\n\nI'm designed to provide farm-specific advice using your sensor data, weather, satellite imagery, market prices, and farm history. Some of these integrations need to be configured for me to give you the most accurate recommendations.\n\nIn the meantime, you can:\n• Use Scan to check crop health\n• Log activities in Farm Memory\n• Track expenses in My Farm\n• Add tasks to your planner\n\nWhat would you like to do?`
}
