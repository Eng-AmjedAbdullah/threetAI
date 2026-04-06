import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Shield, AlertTriangle, CheckCircle2, TrendingUp, Activity, Search,
  ArrowRight, BarChart2, Clock, Cpu, ChevronRight, User, FileText } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts'
import { useAuth }  from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getStats, getAdminStats }  from '../services/api'
import { exportToPDF } from '../services/exportService'
import { format }    from 'date-fns'
import clsx          from 'clsx'
import ThreatMap     from '../components/soc/ThreatMap'
import ActivityTicker from '../components/soc/ActivityTicker'
import SystemHealth   from '../components/soc/SystemHealth'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-navy-100 rounded-xl shadow-card-lg px-3 py-2.5 text-xs">
      <p className="font-semibold text-navy-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { user, token } = useAuth()
  const toast = useToast()
  const [stats,   setStats]   = useState(null)
  const [adminStats, setAdminStats] = useState(null)
  const [recent,  setRecent]  = useState([])
  const [loading, setLoading] = useState(true)

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    async function load() {
      try {
        if (isAdmin) {
          const [s, a] = await Promise.all([
            getStats(token),
            getAdminStats(token)
          ])
          setStats(s)
          setAdminStats(a)
          setRecent(s.recent || [])
        } else {
          const s = await getStats(token)
          setStats(s)
          setRecent(s.recent || [])
        }
      } catch (e) {
        toast.error('Failed to load dashboard data. Is the backend running?', 'Load Error')
        setStats({ total: 0, attacks: 0, normals: 0, avgConf: 0, activity: [] })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id, token, isAdmin])

  const STAT_CARDS = stats ? [
    { title: 'Total Scans',     value: stats.total.toLocaleString(),   icon: Activity,      color: 'text-brand-blue',   bg: 'bg-blue-50',    iconBg: 'bg-brand-blue',  change: '+12% this week',  positive: true },
    { title: 'Attacks Detected',value: stats.attacks.toLocaleString(), icon: AlertTriangle, color: 'text-red-600',      bg: 'bg-red-50',     iconBg: 'bg-red-500',     change: stats.total > 0 ? `${((stats.attacks/stats.total)*100).toFixed(1)}% of total` : '—', positive: false },
    { title: 'Normal Traffic',  value: stats.normals.toLocaleString(), icon: CheckCircle2,  color: 'text-emerald-600',  bg: 'bg-emerald-50', iconBg: 'bg-emerald-500', change: stats.total > 0 ? `${((stats.normals/stats.total)*100).toFixed(1)}% safe` : '—',     positive: true },
    { title: 'Avg. Confidence', value: stats.avgConf ? `${stats.avgConf}%` : '—', icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50', iconBg: 'bg-violet-500', change: 'Model accuracy', positive: true },
  ] : []

  const ADMIN_CARDS = adminStats ? [
    { title: 'Total Users', value: adminStats.total_users.toLocaleString(), icon: User, color: 'text-brand-blue', bg: 'bg-blue-50', iconBg: 'bg-brand-blue' },
    { title: 'Global Scans', value: adminStats.total_scans.toLocaleString(), icon: Activity, color: 'text-navy-700', bg: 'bg-navy-50', iconBg: 'bg-navy-700' },
    { title: 'Global Attacks', value: adminStats.total_attacks.toLocaleString(), icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', iconBg: 'bg-red-500' },
    { title: 'System Health', value: '99.9%', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50', iconBg: 'bg-emerald-500' },
  ] : []

  const pieData = stats ? [
    { name: 'Normal', value: stats.normals },
    { name: 'Attack', value: stats.attacks },
  ] : []

  const chartData = stats?.activity?.length
    ? stats.activity.map(d => ({ day: d.day?.slice(5), scans: d.count, attacks: d.attacks }))
    : Array.from({ length: 7 }, (_, i) => ({ day: `Day ${i+1}`, scans: 0, attacks: 0 }))

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const handleExportReport = () => {
    if (!stats || stats.total === 0) {
      toast.error('No data to export.')
      return
    }
    
    // Create a summary scan data object for the PDF
    const summaryData = {
      id: 'DASHBOARD-SUMMARY',
      inputMode: 'DASHBOARD',
      verdict: stats.attacks > stats.normals ? 'ATTACK' : 'NORMAL',
      confidence: stats.avgConf / 100,
      total_records: stats.total,
      createdAt: new Date().toISOString(),
    }
    
    exportToPDF(summaryData, 'Executive Security Summary Report')
    toast.success('Executive report generation started.')
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="h-24 bg-white rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[0,1,2,3].map(i => <div key={i} className="h-36 bg-white rounded-3xl animate-pulse" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-white rounded-3xl animate-pulse" />
          <div className="h-72 bg-white rounded-3xl animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="page-title">{greeting}, {user?.fullName?.split(' ')[0]} 👋</h1>
          <p className="section-subtitle mt-2">
            {isAdmin ? 'System-wide security overview and administrative controls.' : "Here's what's happening in your network analysis."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-start sm:self-auto">
          <button onClick={handleExportReport} className="btn-ghost text-xs gap-1.5 border border-navy-100 bg-white justify-center">
            <FileText size={14} /> Export Report
          </button>
          {!isAdmin && (
            <Link to="/app/detection" className="btn-primary justify-center">
              <Search size={16} /> Run New Scan <ArrowRight size={15} />
            </Link>
          )}
        </div>
      </div>

      {/* Security Operations Center (SOC) Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-navy-900 tracking-tight">Security Operations Center</h2>
            <p className="text-xs text-navy-400 mt-1.5 uppercase tracking-widest font-bold">Real-Time Threat Intelligence & System Monitoring</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-brand-blue/5 border border-brand-blue/10 rounded-xl">
            <div className="w-2 h-2 bg-brand-blue rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">Live SOC Feed Active</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ThreatMap />
            <SystemHealth />
          </div>
          <div className="lg:col-span-1">
            <ActivityTicker />
          </div>
        </div>
      </div>

      {/* Admin Specific Section */}
      {isAdmin && adminStats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ADMIN_CARDS.map(({ title, value, icon: Icon, color, bg, iconBg }) => (
              <div key={title} className="stat-card">
                <div className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center shadow-sm`}>
                    <Icon size={16} className="text-white" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider">{title}</p>
                  <p className={`text-2xl font-extrabold ${color} leading-tight mt-0.5`}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-bold text-navy-900 mb-5">User Roles Distribution</h3>
              <div className="space-y-2.5">
                {adminStats.roles.map(r => (
                  <div key={r.role} className="flex items-center justify-between p-3.5 bg-navy-50 rounded-xl border border-navy-100/50 hover:bg-navy-100/50 transition-colors">
                    <span className="text-sm font-medium text-navy-700 capitalize">{r.role}s</span>
                    <span className="text-sm font-bold text-navy-900 bg-white px-3 py-1 rounded-lg">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 className="font-bold text-navy-900 mb-4">New User Registrations</h3>
              <div className="space-y-3">
                {adminStats.user_activity.map(a => (
                  <div key={a.day} className="flex items-center justify-between p-3 bg-navy-50 rounded-xl">
                    <span className="text-sm font-medium text-navy-700">{format(new Date(a.day), 'MMM d, yyyy')}</span>
                    <span className="text-sm font-bold text-navy-900">+{a.count}</span>
                  </div>
                ))}
                {adminStats.user_activity.length === 0 && (
                  <p className="text-sm text-navy-400 text-center py-4">No recent registrations</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Personal Stats (For both User and Admin) */}
      <div className="pt-4 border-t border-navy-100">
        <h2 className="text-lg font-bold text-navy-900 mb-4">{isAdmin ? 'Your Administrative Activity' : 'Your Recent Activity'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {STAT_CARDS.map(({ title, value, icon: Icon, color, bg, iconBg, change, positive }) => (
            <div key={title} className="stat-card">
              <div className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center shadow-sm`}>
                  <Icon size={16} className="text-white" />
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider">{title}</p>
                <p className={`text-2xl font-extrabold ${color} leading-tight mt-0.5`}>{value}</p>
                <p className={`text-xs font-medium mt-1 ${positive ? 'text-emerald-600' : 'text-red-500'}`}>{change}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-navy-900 text-sm">Detection Activity</h3>
                <p className="text-xs text-navy-400 mt-0.5">Last 7 days</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-blue" />Scans</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400" />Attacks</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gradScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1E6FD9" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1E6FD9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradAttacks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2FF" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="scans"   name="Scans"   stroke="#1E6FD9" strokeWidth={2} fill="url(#gradScans)"   dot={{ fill: '#1E6FD9', r: 3 }} />
                <Area type="monotone" dataKey="attacks" name="Attacks" stroke="#EF4444" strokeWidth={2} fill="url(#gradAttacks)" dot={{ fill: '#EF4444', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div className="mb-5">
              <h3 className="font-bold text-navy-900 text-sm">Traffic Distribution</h3>
              <p className="text-xs text-navy-400 mt-0.5">All-time breakdown</p>
            </div>
            {pieData.every(d => d.value === 0) ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-navy-300">
                <BarChart2 size={32} className="mb-2" />
                <p className="text-xs font-medium">No data yet</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={i === 0 ? '#10B981' : '#EF4444'} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-3">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: i === 0 ? '#10B981' : '#EF4444' }} />
                        <span className="font-medium text-navy-700">{d.name}</span>
                      </div>
                      <span className="font-bold text-navy-900">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent detections & Threat Intelligence */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-navy-900">Recent Detections</h3>
              <p className="text-xs text-navy-400 mt-0.5">Your latest scan results</p>
            </div>
            <Link to="/app/history" className="btn-ghost text-xs flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-navy-300">
              <Cpu size={36} className="mb-3" />
              <p className="font-semibold text-sm">No scans yet</p>
              <p className="text-xs mt-1">Run your first detection to see results here.</p>
              {!isAdmin && <Link to="/app/detection" className="btn-primary mt-4 text-sm"><Search size={14} /> Start Scanning</Link>}
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="data-table min-w-[600px]">
                <thead>
                  <tr><th>Scan ID</th><th>Type</th><th>Verdict</th><th>Confidence</th><th>Date / Time</th></tr>
                </thead>
                <tbody>
                  {recent.map((d) => (
                    <tr key={d.id}>
                      <td className="font-mono text-xs text-navy-400">#{String(d.id).slice(-4).toUpperCase()}</td>
                      <td><span className="text-navy-700 font-medium capitalize">{d.inputMode === 'manual' ? 'Manual Entry' : `CSV — ${d.filename || 'upload'}`}</span></td>
                      <td>
                        <span className={d.verdict === 'ATTACK' ? 'badge-attack' : 'badge-normal'}>
                          {d.verdict === 'ATTACK' ? <><AlertTriangle size={11} /> Attack</> : <><CheckCircle2 size={11} /> Normal</>}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-navy-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${d.verdict === 'ATTACK' ? 'bg-red-400' : 'bg-emerald-400'}`}
                              style={{ width: `${Math.round(d.confidence * 100)}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-navy-700">{Math.round(d.confidence * 100)}%</span>
                        </div>
                      </td>
                      <td className="text-navy-400 text-xs">
                        <div className="flex items-center gap-1"><Clock size={12} />{d.createdAt ? format(new Date(d.createdAt), 'MMM d, HH:mm') : '—'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-5">
          {/* Threat Intelligence Feed */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-navy-900 text-sm">Threat Intelligence</h3>
              <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[10px] font-bold rounded-full uppercase tracking-wider">Live Feed</span>
            </div>
            <div className="space-y-4">
              {[
                { type: 'DoS', trend: 'up', msg: 'Increased SYN Flood activity detected globally.' },
                { type: 'R2L', trend: 'down', msg: 'Remote-to-Local attempts stabilized in EU-West.' },
                { type: 'Probing', trend: 'up', msg: 'New port scanning patterns identified in IoT sectors.' }
              ].map((item, i) => (
                <div key={i} className="p-3 bg-navy-50 rounded-xl border border-navy-100/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-navy-700">{item.type} Analysis</span>
                    {item.trend === 'up' ? (
                      <TrendingUp size={14} className="text-red-500" />
                    ) : (
                      <TrendingUp size={14} className="text-emerald-500 rotate-180" />
                    )}
                  </div>
                  <p className="text-[11px] text-navy-500 leading-tight">{item.msg}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-xs font-bold text-brand-blue bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              View Full Intelligence Report
            </button>
          </div>

          {/* API Access */}
          <div className="card bg-gradient-to-br from-navy-900 to-navy-800 text-white border-none shadow-glow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Cpu size={20} className="text-brand-blue" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Developer API</h3>
                <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Integration</p>
              </div>
            </div>
            <p className="text-xs text-white/70 leading-relaxed mb-4">
              Integrate ThreatGuardAI directly into your infrastructure with our high-performance REST API.
            </p>
            <button 
              onClick={() => toast.info('API access is currently in private beta. Contact support for early access.', 'Coming Soon')}
              className="w-full py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-all shadow-lg shadow-brand-blue/20"
            >
              Request API Access
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
