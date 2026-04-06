import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { AlertCircle, CheckCircle2, ShieldAlert, Cpu, Database, Activity } from 'lucide-react'

const EVENT_TYPES = [
  { type: 'DoS', icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  { type: 'R2L', icon: Database, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { type: 'U2R', icon: Cpu, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { type: 'Probing', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { type: 'Normal', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
]

const LOCATIONS = ['EU-West', 'US-East', 'Asia-Pacific', 'SA-East', 'Global-Edge']

export default function ActivityTicker() {
  const [events, setEvents] = useState([])
  const containerRef = useRef(null)

  useEffect(() => {
    const generateEvent = () => {
      const type = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)]
      const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
      const id = Math.random().toString(36).substr(2, 9)
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      
      const newEvent = {
        id,
        ...type,
        location,
        timestamp,
        details: type.type === 'Normal' 
          ? `Traffic validated at ${location}`
          : `Suspicious ${type.type} activity flagged at ${location}`
      }

      setEvents(prev => [newEvent, ...prev.slice(0, 19)])
    }

    // Initial events
    for (let i = 0; i < 5; i++) generateEvent()

    const interval = setInterval(generateEvent, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="card h-[400px] flex flex-col overflow-hidden p-0">
      <div className="p-4 border-b border-navy-100 flex items-center justify-between bg-navy-50/30">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-brand-blue" />
          <h3 className="font-bold text-navy-900 text-sm">Live Activity Ticker</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Live
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3" ref={containerRef}>
        <AnimatePresence initial={false}>
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`flex items-start gap-3 p-3 rounded-xl border ${event.border} ${event.bg} transition-all`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${event.bg}`}>
                <event.icon size={14} className={event.color} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${event.color}`}>
                    {event.type}
                  </span>
                  <span className="text-[10px] font-mono text-navy-400">{event.timestamp}</span>
                </div>
                <p className="text-xs text-navy-700 font-medium leading-tight truncate">
                  {event.details}
                </p>
                <p className="text-[9px] text-navy-400 mt-1 uppercase tracking-widest font-bold">
                  Node: {event.location}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="p-3 bg-navy-900 text-[9px] font-mono text-white/40 uppercase tracking-widest text-center border-t border-navy-800">
        System_Log_Stream_Active :: Buffer_Size: 20
      </div>
    </div>
  )
}
