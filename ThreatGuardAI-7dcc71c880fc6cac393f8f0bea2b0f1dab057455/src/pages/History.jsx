import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  History as HistoryIcon, Search, Filter, Download, Trash2,
  AlertTriangle, CheckCircle2, Clock, ChevronLeft, ChevronRight,
  MoreVertical, FileText, Cpu, ExternalLink, Calendar
} from 'lucide-react'
import { useAuth }  from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getHistory, clearHistory } from '../services/api'
import { exportToCSV, exportToPDF } from '../services/exportService'
import { format } from 'date-fns'
import clsx from 'clsx'
import ConfirmModal from '../components/ConfirmModal'

export default function History() {
  const { token } = useAuth()
  const toast    = useToast()
  const navigate = useNavigate()

  const [scans,    setScans]    = useState([])
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [page,     setPage]     = useState(1)
  const [verdict,  setVerdict]  = useState('all')
  const [search,   setSearch]   = useState('')
  const [limit]                 = useState(10)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getHistory({
          limit,
          offset: (page - 1) * limit,
          verdict,
          search
        }, token)
        setScans(data.rows || [])
        setTotal(data.total || 0)
      } catch (e) {
        const msg = e.message || 'Failed to load your scan history.'
        const title = e.title || 'Load Error'
        toast.error(msg, title)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [page, verdict, search, token, limit])

  const handleClear = async () => {
    try {
      await clearHistory(token)
      setScans([])
      setTotal(0)
      toast.success('All your scan history has been cleared successfully.', 'History Cleared ✓')
    } catch (e) {
      const msg = e.message || 'Failed to clear your scan history.'
      const title = e.title || 'Deletion Failed'
      toast.error(msg, title)
    }
  }

  const handleExportCSV = () => {
    if (scans.length === 0) {
      toast.warning('No scan data available to export.')
      return
    }
    exportToCSV(scans)
    toast.success('CSV export has been generated successfully.', 'Export Complete ✓')
  }

  const handleExportPDF = () => {
    if (scans.length === 0) {
      toast.warning('No scan data available to export.')
      return
    }
    exportToPDF(scans, 'Security Audit History Report')
    toast.success('PDF report generation has started successfully.', 'Export Complete ✓')
  }

  const handleView = (scan) => {
    navigate('/app/results', { state: { detection: scan, mode: scan.inputMode } })
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="page-title">Scan History</h1>
          <p className="section-subtitle mt-2">Review and manage your past network intrusion detections.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button onClick={handleExportPDF} className="btn-ghost text-xs gap-1.5 border border-navy-100 justify-center">
            <FileText size={14} /> Export PDF
          </button>
          <button onClick={handleExportCSV} className="btn-ghost text-xs gap-1.5 border border-navy-100 justify-center">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => setShowConfirm(true)} className="btn-ghost text-xs gap-1.5 border border-red-100 text-red-600 hover:bg-red-50 justify-center">
            <Trash2 size={14} /> Clear All
          </button>
        </div>
      </div>

      <ConfirmModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleClear}
        title="Clear Scan History"
        message="Are you sure you want to clear your entire scan history? This action is permanent and cannot be undone."
        confirmText="Clear History"
      />

      {/* Filters */}
      <div className="card p-5 flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" size={16} />
          <input type="text" placeholder="Search by filename or verdict..."
            className="input-field pl-10 h-11 text-sm"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <div className="flex items-center gap-3 md:gap-2">
          <Filter size={16} className="text-navy-400" />
          <select className="input-field h-11 text-sm py-0 pr-8 min-w-[150px]"
            value={verdict} onChange={e => { setVerdict(e.target.value); setPage(1) }}>
            <option value="all">All Verdicts</option>
            <option value="attack">Attacks Only</option>
            <option value="normal">Normal Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Scan ID</th>
                <th>Source / Mode</th>
                <th>Verdict</th>
                <th>Confidence</th>
                <th>Records</th>
                <th>Date & Time</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center">
                    <div className="text-navy-400 text-lg font-medium">
                      ...loading
                    </div>
                  </td>
                </tr>
              ) : scans.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center">
                    <div className="flex flex-col items-center text-navy-300">
                      <HistoryIcon size={48} className="mb-4 opacity-20" />
                      <p className="font-bold text-navy-900">No scans found</p>
                      <p className="text-sm mt-1">Try adjusting your filters or run a new scan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                scans.map((scan) => (
                  <tr key={scan.id} className="group hover:bg-navy-50/50 transition-colors cursor-pointer" onClick={() => handleView(scan)}>
                    <td className="font-mono text-xs text-navy-400">#{String(scan.id).slice(-4).toUpperCase()}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {scan.inputMode === 'manual' ? <Cpu size={14} className="text-navy-400" /> : <FileText size={14} className="text-navy-400" />}
                        <div>
                          <p className="text-sm font-bold text-navy-900 capitalize">{scan.inputMode}</p>
                          {scan.filename && <p className="text-[10px] text-navy-400 truncate max-w-[120px]">{scan.filename}</p>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={scan.verdict === 'ATTACK' ? 'badge-attack' : 'badge-normal'}>
                        {scan.verdict === 'ATTACK' ? <><AlertTriangle size={11} /> Attack</> : <><CheckCircle2 size={11} /> Normal</>}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1 bg-navy-100 rounded-full overflow-hidden">
                          <div className={clsx('h-full rounded-full', scan.verdict === 'ATTACK' ? 'bg-red-400' : 'bg-emerald-400')}
                            style={{ width: `${Math.round(scan.confidence * 100)}%` }} />
                        </div>
                        <span className="text-xs font-bold text-navy-700">{Math.round(scan.confidence * 100)}%</span>
                      </div>
                    </td>
                    <td>
                      <p className="text-xs font-bold text-navy-700">{scan.totalRecords?.toLocaleString() || 1}</p>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-xs text-navy-500">
                        <Calendar size={12} />
                        {scan.createdAt ? format(new Date(scan.createdAt), 'MMM d, HH:mm') : '—'}
                      </div>
                    </td>
                    <td className="text-right">
                      <button className="p-2 text-navy-300 hover:text-brand-blue hover:bg-white rounded-lg transition-all">
                        <ExternalLink size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className="px-6 py-4 border-t border-navy-50 flex items-center justify-between bg-navy-50/30">
            <p className="text-xs text-navy-500">
              Showing <span className="font-bold text-navy-900">{(page - 1) * limit + 1}</span> to <span className="font-bold text-navy-900">{Math.min(page * limit, total)}</span> of <span className="font-bold text-navy-900">{total}</span> results
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-navy-100 disabled:opacity-30 transition-all">
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let p = i + 1
                if (totalPages > 5 && page > 3) p = page - 3 + i + 1
                if (p > totalPages) return null
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={clsx(
                      'w-9 h-9 rounded-lg text-xs font-bold transition-all border',
                      page === p ? 'bg-brand-blue text-white border-brand-blue shadow-glow-sm' : 'bg-white text-navy-600 border-navy-100 hover:border-navy-300'
                    )}>
                    {p}
                  </button>
                )
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-navy-100 disabled:opacity-30 transition-all">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
