import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { AreaChart, Area, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts'
import { Cpu, Database, Activity, Zap } from 'lucide-react'

export default function SystemHealth() {
  const [data, setData] = useState([])
  const [metrics, setMetrics] = useState({ cpu: 0, mem: 0, net: 0, latency: 0 })

  useEffect(() => {
    const generateData = () => {
      const cpu = Math.floor(Math.random() * 30) + 20 // 20-50%
      const mem = Math.floor(Math.random() * 15) + 40 // 40-55%
      const net = Math.floor(Math.random() * 50) + 100 // 100-150 Mbps
      const latency = Math.floor(Math.random() * 5) + 2 // 2-7 ms
      
      setMetrics({ cpu, mem, net, latency })
      
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      const newDataPoint = { timestamp, cpu, mem, net, latency }
      
      setData(prev => [...prev.slice(-19), newDataPoint])
    }

    // Initial data
    for (let i = 0; i < 20; i++) generateData()

    const interval = setInterval(generateData, 2000)
    return () => clearInterval(interval)
  }, [])

  const MetricCard = ({ icon: Icon, label, value, unit, color, bg, iconBg }) => (
    <div className="p-4 bg-white border border-navy-100 rounded-2xl shadow-sm flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center shadow-sm`}>
          <Icon size={14} className="text-white" />
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold text-navy-400 uppercase tracking-wider mb-0.5">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className={`text-lg font-black ${color}`}>{value}</span>
          <span className="text-[10px] font-bold text-navy-400 uppercase">{unit}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="card p-0 overflow-hidden">
      <div className="p-4 border-b border-navy-100 flex items-center justify-between bg-navy-50/30">
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-brand-blue" />
          <h3 className="font-bold text-navy-900 text-sm">System Health Monitor</h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-navy-400 uppercase tracking-wider">
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-brand-blue rounded-full" /> CPU</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-brand-purple rounded-full" /> MEM</span>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <MetricCard icon={Cpu} label="CPU Usage" value={metrics.cpu} unit="%" color="text-brand-blue" bg="bg-blue-50" iconBg="bg-brand-blue" />
          <MetricCard icon={Database} label="Memory" value={metrics.mem} unit="%" color="text-brand-purple" bg="bg-purple-50" iconBg="bg-brand-purple" />
          <MetricCard icon={Activity} label="Throughput" value={metrics.net} unit="Mbps" color="text-emerald-600" bg="bg-emerald-50" iconBg="bg-emerald-500" />
          <MetricCard icon={Zap} label="Latency" value={metrics.latency} unit="ms" color="text-amber-600" bg="bg-amber-50" iconBg="bg-amber-500" />
        </div>

        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="gradCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1E6FD9" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1E6FD9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradMem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8B5CF6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="timestamp" hide />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-navy-900 border border-navy-700 p-2 rounded-lg shadow-xl text-[10px] text-white font-mono">
                        <p className="mb-1 text-white/50">{payload[0].payload.timestamp}</p>
                        <p className="text-brand-blue">CPU: {payload[0].value}%</p>
                        <p className="text-brand-purple">MEM: {payload[1].value}%</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area type="monotone" dataKey="cpu" stroke="#1E6FD9" strokeWidth={2} fill="url(#gradCpu)" animationDuration={1000} />
              <Area type="monotone" dataKey="mem" stroke="#8B5CF6" strokeWidth={2} fill="url(#gradMem)" animationDuration={1000} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-3 bg-navy-50 text-[10px] font-bold text-navy-400 uppercase tracking-widest flex items-center justify-between border-t border-navy-100">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Engine: Active
        </div>
        <div>Uptime: 14d 06h 22m</div>
      </div>
    </div>
  )
}
