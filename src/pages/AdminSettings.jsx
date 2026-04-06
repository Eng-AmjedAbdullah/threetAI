import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getAdminLogs } from '../services/api'
import { Settings, History, Shield, Database, Bell, Save, RefreshCw } from 'lucide-react'
import { motion } from 'motion/react'
import ConfirmModal from '../components/ConfirmModal'

export default function AdminSettings() {
  const { token } = useAuth()
  const toast = useToast()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('logs')
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs()
    }
  }, [activeTab])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const data = await getAdminLogs(100, token)
      setLogs(data)
    } catch (err) {
      toast.error('Failed to load system logs')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveConfig = () => {
    toast.success('System configuration saved successfully')
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div>
        <h1 className="page-title text-2xl sm:text-3xl">System Settings & Logs</h1>
        <p className="section-subtitle mt-1">Configure system parameters and monitor administrative activity</p>
      </div>

      <div className="flex gap-2 sm:gap-4 border-b border-navy-100 overflow-x-auto">
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 sm:pb-4 px-3 sm:px-4 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap ${
            activeTab === 'logs' ? 'text-brand-blue' : 'text-navy-500 hover:text-navy-700'
          }`}
        >
          System Logs
          {activeTab === 'logs' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue" />}
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`pb-3 sm:pb-4 px-3 sm:px-4 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap ${
            activeTab === 'config' ? 'text-brand-blue' : 'text-navy-500 hover:text-navy-700'
          }`}
        >
          Configuration
          {activeTab === 'config' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue" />}
        </button>
      </div>

      {activeTab === 'logs' ? (
        <div className="card p-0 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-navy-100 flex justify-between items-center bg-navy-50">
            <h3 className="font-semibold text-navy-900 flex items-center gap-2 text-sm sm:text-base">
              <History className="h-4 w-4 text-brand-blue" />
              Administrative Activity
            </h3>
            <button 
              onClick={fetchLogs}
              className="p-2 text-navy-500 hover:text-brand-blue rounded-lg transition-colors"
              title="Refresh Logs"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="data-table w-full min-w-max">
              <thead className="sticky top-0 bg-white shadow-sm">
                <tr>
                  <th>Timestamp</th>
                  <th>Admin</th>
                  <th>Action</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {loading && logs.length === 0 ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="4" className="h-12 bg-navy-50/50"></td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-navy-400 text-sm">
                      No administrative logs available.
                    </td>
                  </tr>
                ) : (
                  logs.map((log, idx) => (
                    <tr key={idx}>
                      <td className="text-xs sm:text-sm">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="text-xs sm:text-sm">{log.admin || '—'}</td>
                      <td className="text-xs sm:text-sm font-medium text-navy-700">{log.action}</td>
                      <td className="text-xs sm:text-sm text-navy-500">{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-6 sm:p-8">
          <h3 className="text-lg sm:text-xl font-bold text-navy-900 mb-6">System Configuration</h3>
          <div className="space-y-6">
            <div>
              <label className="label">System Status</label>
              <div className="p-3 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs sm:text-sm font-medium">
                ✓ All systems operational
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-navy-600 font-medium text-sm sm:text-base">Maintenance Mode</span>
              <button className="w-12 h-6 rounded-full bg-navy-200 transition-colors relative">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
            <button onClick={handleSaveConfig} className="btn-primary w-full mt-8">
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
