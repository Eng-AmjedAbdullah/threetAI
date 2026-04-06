import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getAdminReportsSummary, getAdminDetections } from '../services/api'
import { BarChart3, PieChart, TrendingUp, Download, FileText, AlertTriangle, ShieldCheck, Activity, Search } from 'lucide-react'
import { motion } from 'motion/react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts'

const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6']

export default function AdminReports() {
  const { token } = useAuth()
  const toast = useToast()
  const [reportData, setReportData] = useState(null)
  const [detections, setDetections] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchReportData()
    } else {
      fetchDetections()
    }
  }, [activeTab])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const data = await getAdminReportsSummary(token)
      setReportData(data)
    } catch (err) {
      const msg = err.message || 'Failed to load report data. Please try again.'
      const title = err.title || 'Load Error'
      toast.error(msg, title)
    } finally {
      setLoading(false)
    }
  }

  const fetchDetections = async () => {
    try {
      setLoading(true)
      const data = await getAdminDetections({ limit: 50 }, token)
      setDetections(data.rows)
    } catch (err) {
      const msg = err.message || 'Failed to load detection records. Please try again.'
      const title = err.title || 'Load Error'
      toast.error(msg, title)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex gap-2 sm:gap-4 border-b border-navy-100 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 sm:pb-4 px-3 sm:px-4 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap ${
            activeTab === 'overview' ? 'text-brand-blue' : 'text-navy-500 hover:text-navy-700'
          }`}
        >
          Overview
          {activeTab === 'overview' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue" />}
        </button>
        <button
          onClick={() => setActiveTab('detections')}
          className={`pb-3 sm:pb-4 px-3 sm:px-4 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap ${
            activeTab === 'detections' ? 'text-brand-blue' : 'text-navy-500 hover:text-navy-700'
          }`}
        >
          Recent Detections
          {activeTab === 'detections' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue" />}
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-navy-400 text-lg font-medium">
                ...loading
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Users" 
                  value={reportData?.total_users?.[0]?.val || 0} 
                  icon={ShieldCheck} 
                  color="indigo" 
                />
                <StatCard 
                  title="Total Scans" 
                  value={reportData?.total_scans?.[0]?.val || 0} 
                  icon={Activity} 
                  color="blue" 
                />
                <StatCard 
                  title="Attacks Detected" 
                  value={reportData?.total_attacks?.[0]?.val || 0} 
                  icon={AlertTriangle} 
                  color="rose" 
                />
                <StatCard 
                  title="System Health" 
                  value="99.9%" 
                  icon={TrendingUp} 
                  color="emerald" 
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-indigo-600" />
                    Attacks by Input Mode
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={reportData?.attacks_by_mode?.map(item => ({
                            name: item.inputMode?.toUpperCase() || 'UNKNOWN',
                            value: item.val
                          })) || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {reportData?.attacks_by_mode?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    Top Active Users
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData?.top_users?.map(item => ({
                        name: item.fullName,
                        scans: item.scanCount
                      })) || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="scans" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Mode</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Verdict</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Confidence</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="5" className="px-6 py-4 h-12 bg-gray-50/50"></td>
                    </tr>
                  ))
                ) : (
                  detections.map((det) => (
                    <tr key={det.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{det.userName}</div>
                        <div className="text-xs text-gray-500">{det.userEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-600">
                          {det.inputMode}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          det.verdict === 'ATTACK' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {det.verdict}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {Math.round(det.confidence * 100)}%
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {det.createdAt ? new Date(det.createdAt).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600',
    blue: 'bg-blue-50 text-blue-600',
    rose: 'bg-rose-50 text-rose-600',
    emerald: 'bg-emerald-50 text-emerald-600'
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{title}</div>
    </div>
  )
}
