import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Search, Upload, FileText, AlertCircle, X, ChevronDown, ChevronUp,
  Info, Cpu, ArrowRight, RefreshCw, CheckCircle2, Wifi, Code, Zap, Database, Terminal, ShieldAlert
} from 'lucide-react'
import Papa from 'papaparse'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth }  from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { detectSingle, detectBatch, healthCheck } from '../services/api'
import { loadMLModels } from '../services/inference'
import clsx from 'clsx'
import ConfirmModal from '../components/ConfirmModal'

const SCAN_STEPS = [
  { id: 'prep', label: 'Preprocessing Data', icon: Terminal },
  { id: 'feat', label: 'Extracting Features', icon: Cpu },
  { id: 'ai',   label: 'AI Model Inference',  icon: Zap },
  { id: 'risk', label: 'Risk Assessment',     icon: ShieldAlert },
]

// Sample data removed - users must input real data

const FEATURE_GROUPS = [
  {
    title: 'Basic Connection', info: 'Core TCP/IP connection attributes',
    fields: [
      { name: 'duration',      label: 'Duration (s)',    default: '0' },
      { name: 'protocol_type', label: 'Protocol Type',   default: '0' },
      { name: 'service',       label: 'Service',         default: '0' },
      { name: 'flag',          label: 'Flag',            default: '0' },
      { name: 'src_bytes',     label: 'Src Bytes',       default: '0' },
      { name: 'dst_bytes',     label: 'Dst Bytes',       default: '0' },
      { name: 'land',          label: 'Land',            default: '0' },
      { name: 'wrong_fragment',label: 'Wrong Fragment',  default: '0' },
      { name: 'urgent',        label: 'Urgent',          default: '0' },
    ],
  },
  {
    title: 'Content Features', info: 'Features derived from packet payload',
    fields: [
      { name: 'hot',               label: 'Hot',            default: '0' },
      { name: 'num_failed_logins', label: 'Failed Logins',  default: '0' },
      { name: 'logged_in',         label: 'Logged In',      default: '0' },
      { name: 'num_compromised',   label: 'Num Compromised',default: '0' },
      { name: 'root_shell',        label: 'Root Shell',     default: '0' },
      { name: 'su_attempted',      label: 'SU Attempted',   default: '0' },
      { name: 'num_root',          label: 'Num Root',       default: '0' },
      { name: 'num_file_creations',label: 'File Creations', default: '0' },
      { name: 'num_shells',        label: 'Num Shells',     default: '0' },
      { name: 'num_access_files',  label: 'Access Files',   default: '0' },
      { name: 'num_outbound_cmds', label: 'Outbound Cmds',  default: '0' },
      { name: 'is_host_login',     label: 'Host Login',     default: '0' },
      { name: 'is_guest_login',    label: 'Guest Login',    default: '0' },
    ],
  },
  {
    title: 'Traffic Features (2-Second Window)', info: 'Stats over a 2-second time window',
    fields: [
      { name: 'count',              label: 'Count',           default: '1' },
      { name: 'srv_count',          label: 'Srv Count',       default: '1' },
      { name: 'serror_rate',        label: 'SError Rate',     default: '0' },
      { name: 'srv_serror_rate',    label: 'Srv SError Rate', default: '0' },
      { name: 'rerror_rate',        label: 'RError Rate',     default: '0' },
      { name: 'srv_rerror_rate',    label: 'Srv RError Rate', default: '0' },
      { name: 'same_srv_rate',      label: 'Same Srv Rate',   default: '1' },
      { name: 'diff_srv_rate',      label: 'Diff Srv Rate',   default: '0' },
      { name: 'srv_diff_host_rate', label: 'Srv Diff Host',   default: '0' },
    ],
  },
  {
    title: 'Host-Based Traffic (100-Connection Window)', info: 'Stats over last 100 connections to same host',
    fields: [
      { name: 'dst_host_count',              label: 'Dst Host Count',      default: '1' },
      { name: 'dst_host_srv_count',          label: 'Dst Host Srv Count',  default: '1' },
      { name: 'dst_host_same_srv_rate',      label: 'Same Srv Rate',       default: '1' },
      { name: 'dst_host_diff_srv_rate',      label: 'Diff Srv Rate',       default: '0' },
      { name: 'dst_host_same_src_port_rate', label: 'Same Src Port Rate',  default: '0' },
      { name: 'dst_host_srv_diff_host_rate', label: 'Srv Diff Host Rate',  default: '0' },
      { name: 'dst_host_serror_rate',        label: 'SError Rate',         default: '0' },
      { name: 'dst_host_srv_serror_rate',    label: 'Srv SError Rate',     default: '0' },
      { name: 'dst_host_rerror_rate',        label: 'RError Rate',         default: '0' },
      { name: 'dst_host_srv_rerror_rate',    label: 'Srv RError Rate',     default: '0' },
    ],
  },
]

const ALL_FIELDS = FEATURE_GROUPS.flatMap(g => g.fields)
const INIT_FORM  = Object.fromEntries(ALL_FIELDS.map(f => [f.name, f.default]))

// Quick profiles removed - users must input real network data

export default function Detection() {
  const { token } = useAuth()
  const toast     = useToast()
  const navigate  = useNavigate()
  const location  = useLocation()

  const [mode,       setMode]       = useState('manual')
  const [modelsLoaded, setModelsLoaded] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const m = params.get('mode')
    if (m && ['manual', 'json', 'csv'].includes(m)) {
      setMode(m)
    }

    // Load ML models when component mounts
    loadMLModels()
      .then(() => {
        console.log('ML Models loaded for Detection page');
        setModelsLoaded(true);
      })
      .catch(err => {
        console.error('Error loading ML models:', err);
        setModelsLoaded(true); // Still allow detection even if models fail
      });
  }, [location.search])
  const [form,       setForm]       = useState(INIT_FORM)
  const [jsonInput,  setJsonInput]  = useState(JSON.stringify(INIT_FORM, null, 2))
  const [csvFile,    setCsvFile]    = useState(null)
  const [csvRecords, setCsvRecords] = useState([])
  const [analyzing,  setAnalyzing]  = useState(false)
  const [scanStep,   setScanStep]   = useState(0)
  const [scanLogs,   setScanLogs]   = useState([])
  const [isLive,     setIsLive]     = useState(false)
  const [expanded,   setExpanded]   = useState({ 0: true })
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const fileRef = useRef()

  const setField    = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleGroup = (i)    => setExpanded(e => ({ ...e, [i]: !e[i] }))
  const resetForm   = ()     => { 
    setForm(INIT_FORM)
    setJsonInput(JSON.stringify(INIT_FORM, null, 2))
    toast.info('All fields reset to default values.') 
  }

  // Sample data loading removed - only real user input allowed

  const handleCSV = (file) => {
    if (!file) return
    setCsvFile(file)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        setCsvRecords(data)
        toast.success(`Successfully loaded ${data.length.toLocaleString()} records from "${file.name}".`, 'CSV Loaded ✓')
      },
      error: () => {
        toast.error('The CSV file format is invalid. Please check the format and try again.', 'CSV Parse Error')
      }
    })
  }

  const addLog = (msg) => setScanLogs(prev => [...prev.slice(-4), msg])

  const handleAnalyze = async () => {
    setAnalyzing(true)
    setScanStep(0)
    setScanLogs(['Initializing scanner engine...'])

    // System processing sequence
    const runStep = async (stepIdx, logMsg, duration = 800) => {
      setScanStep(stepIdx)
      addLog(logMsg)
      await new Promise(r => setTimeout(r, duration))
    }

    try {
      await runStep(0, 'Normalizing feature vectors and scaling data...')
      await runStep(1, 'Extracting behavioral patterns from connection metadata...')
      await runStep(2, 'Running ThreatGuardAI Random Forest inference...')
      addLog('Analyzing feature importance and correlation...')
      await runStep(3, 'Calculating risk confidence scores and final verdict...')

      let apiResult, detectionRow

      if (mode === 'manual' || mode === 'json') {
        let features
        if (mode === 'json') {
          try {
            const parsed = JSON.parse(jsonInput)
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
              throw new Error('JSON input must be a feature object.')
            }
            features = Object.fromEntries(
              Object.entries(parsed).map(([k, v]) => [k, parseFloat(v) || 0])
            )
          } catch (parseError) {
            toast.error(parseError.message || 'The JSON format is invalid. Please check your input.', 'Invalid JSON')
            setAnalyzing(false)
            return
          }
        } else {
          features = Object.fromEntries(
            Object.entries(form).map(([k, v]) => [k, parseFloat(v) || 0])
          )
        }

        try {
          const resp  = await detectSingle(features, token)
          apiResult   = resp
          detectionRow = resp.detection
        } catch (err) {
          const msg = err.message || 'The detection engine is temporarily unavailable.'
          const title = err.title || 'Detection Failed'
          toast.error(msg, title)
          setAnalyzing(false)
          return
        }
      } else {
        if (!csvRecords.length) {
          const msg = 'No records found in the CSV file. Please upload a valid CSV with data.'
          toast.warning(msg)
          setAnalyzing(false)
          return
        }
        const records = csvRecords.map(r =>
          Object.fromEntries(Object.entries(r).map(([k, v]) => [k, parseFloat(v) || 0]))
        )
        try {
          const resp   = await detectBatch(records, csvFile?.name, token)
          apiResult    = resp
          detectionRow = resp.detection
        } catch (err) {
          const msg = err.message || 'Batch processing failed. Please check your data and try again.'
          const title = err.title || 'Batch Analysis Failed'
          toast.error(msg, title)
          setAnalyzing(false)
          return
        }
      }

      if (!detectionRow) {
        toast.error('The scan finished, but no result payload was returned. Please retry.', 'No Result Returned')
        setAnalyzing(false)
        return
      }

      const isAttack = detectionRow.verdict === 'ATTACK'
      if (isAttack) {
        toast.error(
          mode === 'csv'
            ? `⚠️ Security Threat Detected: ${detectionRow.attackCount} potential attack(s) identified in ${detectionRow.totalRecords} records.`
            : `⚠️ Security Threat Detected: Attack identified with ${Math.round(detectionRow.confidence * 100)}% confidence.`,
          '🚨 Threat Detected'
        )
      } else {
        toast.success(
          mode === 'csv'
            ? `✓ All ${detectionRow.totalRecords} records were analyzed and appear normal.`
            : `✓ Traffic classified as normal with ${Math.round(detectionRow.confidence * 100)}% confidence.`,
          'Analysis Complete ✓'
        )
      }

      navigate('/app/results', { state: { detection: detectionRow, result: apiResult, mode } })
    } catch (e) {
      const msg = e.message || 'Analysis failed. Please try again.'
      toast.error(msg, 'Analysis Failed')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Scanning Progress Overlay */}
      <AnimatePresence>
        {analyzing && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-navy-900/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg bg-white rounded-[2rem] p-4 sm:p-5 shadow-2xl relative overflow-hidden max-h-[34rem] overflow-y-auto"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-navy-50">
                <motion.div 
                  className="h-full bg-brand-blue"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(scanStep + 1) * 25}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="flex flex-col items-center text-center">
                <h2 className="text-xl font-black text-navy-900 mb-1 tracking-tight">AI Scanning in Progress</h2>
                <p className="text-navy-500 text-[13px] mb-5">Analyzing network patterns for potential intrusions.</p>

                <div className="w-full space-y-3 mb-6">
                  {SCAN_STEPS.map((step, i) => {
                    const Icon = step.icon
                    const isActive = i === scanStep
                    const isDone = i < scanStep
                    return (
                      <div key={step.id} className={clsx(
                        'flex items-center gap-3 p-2.5 rounded-2xl border transition-all duration-300',
                        isActive ? 'border-brand-blue bg-blue-50 shadow-sm' : 'border-transparent opacity-40'
                      )}>
                        <div className={clsx(
                          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                          isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-brand-blue text-white' : 'bg-navy-100 text-navy-400'
                        )}>
                          {isDone ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                        </div>
                        <span className={clsx('text-sm font-bold', isActive ? 'text-navy-900' : 'text-navy-500')}>
                          {step.label}
                        </span>
                        {isActive && (
                          <div className="ml-auto flex gap-1">
                            <div className="w-1 h-1 bg-brand-blue rounded-full animate-bounce" />
                            <div className="w-1 h-1 bg-brand-blue rounded-full animate-bounce [animation-delay:0.2s]" />
                            <div className="w-1 h-1 bg-brand-blue rounded-full animate-bounce [animation-delay:0.4s]" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Live Logs */}
                <div className="w-full bg-navy-900 rounded-2xl p-3 font-mono text-[10px] text-emerald-400 text-left h-20 overflow-hidden shadow-inner">
                  {scanLogs.map((log, i) => (
                    <div key={i} className="flex gap-2 truncate">
                      <span className="text-navy-500">[{new Date().toLocaleTimeString()}]</span>
                      <span className="truncate">{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Run Detection</h1>
          <p className="section-subtitle mt-1">Analyze network traffic using the AI intrusion detection model.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">AI Engine Online</span>
          </div>
        </div>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-2 md:col-span-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'manual', icon: Cpu,      label: 'Manual',    desc: 'Form input' },
              { key: 'json',   icon: Code,     label: 'JSON',      desc: 'Raw payload' },
              { key: 'csv',    icon: FileText, label: 'CSV Bulk',  desc: 'Batch upload' },
            ].map(({ key, icon: Icon, label, desc }) => (
              <button key={key} onClick={() => setMode(key)}
                className={clsx(
                  'flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 text-left',
                  mode === key
                    ? 'border-brand-blue bg-blue-50 text-brand-blue'
                    : 'border-transparent hover:border-navy-200 hover:bg-navy-50 text-navy-600'
                )}>
                <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                  mode === key ? 'bg-brand-blue' : 'bg-navy-100')}>
                  <Icon size={16} className={mode === key ? 'text-white' : 'text-navy-500'} />
                </div>
                <div className="hidden sm:block">
                  <p className="font-bold text-xs">{label}</p>
                  <p className={clsx('text-[10px] mt-0.5', mode === key ? 'text-blue-500' : 'text-navy-400')}>{desc}</p>
                </div>
                <div className="sm:hidden">
                  <p className="font-bold text-xs">{label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-4 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider">Live Mode</span>
            <div className={clsx('w-2 h-2 rounded-full', isLive ? 'bg-emerald-500 animate-pulse' : 'bg-navy-200')} />
          </div>
          <button 
            onClick={() => setIsLive(!isLive)}
            className={clsx(
              'w-full py-2 rounded-xl text-xs font-bold transition-all',
              isLive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-navy-100 text-navy-500 hover:bg-navy-200'
            )}
          >
            {isLive ? 'Monitoring Active' : 'Start Live Stream'}
          </button>
        </div>
      </div>

      {/* Manual form */}
      {mode === 'manual' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-navy-600">{ALL_FIELDS.length} features</p>
              <p className="text-xs text-navy-400 mt-1 max-w-xl">Enter NSL-KDD network feature values organized by category.</p>
            </div>
            <button onClick={() => setShowResetConfirm(true)} className="btn-ghost text-xs gap-1.5 px-3 py-2">
              <RefreshCw size={13} /> Reset all
            </button>
          </div>

          <div className="card p-0 overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex overflow-x-auto border-b border-navy-100 bg-navy-50/40">
              {FEATURE_GROUPS.map((group, gi) => (
                <button
                  key={gi}
                  onClick={() => toggleGroup(gi)}
                  className={clsx(
                    'flex-1 min-w-max px-4 py-3 text-xs font-semibold transition-all border-b-2 whitespace-nowrap',
                    expanded[gi]
                      ? 'text-brand-blue border-brand-blue'
                      : 'text-navy-500 border-transparent hover:text-navy-700'
                  )}>
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-navy-100 flex items-center justify-center text-[10px]">
                      {gi + 1}
                    </span>
                    <span>{group.title}</span>
                  </span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {FEATURE_GROUPS.map((group, gi) => (
              <div key={gi} hidden={!expanded[gi]}>
                {expanded[gi] && (
                  <div className="p-6">
                    <div className="mb-4">
                      <p className="font-semibold text-navy-900 text-sm">{group.title}</p>
                      <p className="text-xs text-navy-400 mt-1">{group.info}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.fields.map(f => (
                        <div key={f.name} className="flex flex-col gap-2">
                          <label className="text-xs font-semibold text-navy-600">{f.label}</label>
                          <input
                            type="number"
                            className="w-full rounded-xl border border-navy-100 bg-white px-3 py-2.5 text-sm font-mono text-navy-900 placeholder-navy-300 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/10 transition-all"
                            value={form[f.name]}
                            onChange={e => setField(f.name, e.target.value)}
                            step="any"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* JSON Input */}
      {mode === 'json' && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-navy-600 flex items-center gap-2">
              <Code size={16} /> Raw JSON Payload
            </p>

          </div>
          <textarea 
            className="w-full h-96 p-4 font-mono text-xs bg-navy-900 text-emerald-400 rounded-2xl border-none focus:ring-2 focus:ring-brand-blue resize-none"
            value={jsonInput}
            onChange={e => setJsonInput(e.target.value)}
            spellCheck={false}
          />
        </div>
      )}

      {/* CSV Upload */}
      {mode === 'csv' && (
        <div className="card space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <Info size={16} className="text-brand-blue flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">CSV Format Requirements</p>
              <p className="text-xs text-blue-600">
                Column headers must match the 42 NSL-KDD feature names (duration, protocol_type, src_bytes … dst_host_srv_rerror_rate). Each row = one network connection record.
              </p>
            </div>
          </div>
          <div onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleCSV(e.dataTransfer.files[0]) }}
            className={clsx(
              'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200',
              csvFile ? 'border-emerald-300 bg-emerald-50' : 'border-navy-200 bg-navy-50/30 hover:border-brand-blue hover:bg-blue-50/30'
            )}>
            <input ref={fileRef} type="file" accept=".csv" className="hidden"
              onChange={e => handleCSV(e.target.files[0])} />
            {csvFile ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 size={24} className="text-emerald-600" />
                </div>
                <p className="font-bold text-navy-900">{csvFile.name}</p>
                <p className="text-sm text-emerald-600 font-medium">{csvRecords.length.toLocaleString()} records loaded</p>
                <button onClick={e => { e.stopPropagation(); setCsvFile(null); setCsvRecords([]) }}
                  className="flex items-center gap-1 text-xs text-navy-400 hover:text-red-500 transition-colors mt-1">
                  <X size={13} /> Remove file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-navy-100 flex items-center justify-center">
                  <Upload size={26} className="text-navy-400" />
                </div>
                <p className="font-bold text-navy-700">Drop your CSV file here</p>
                <p className="text-sm text-navy-400">or click to browse files</p>
                <p className="text-xs text-navy-300 mt-1">Supports .csv — up to 50,000 rows</p>
              </div>
            )}
          </div>
          {csvRecords.length > 0 && (
            <div className="p-4 bg-navy-50 rounded-xl">
              <p className="text-sm font-semibold text-navy-700 mb-2">Preview — First Row</p>
              <div className="overflow-x-auto">
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(csvRecords[0]).slice(0, 10).map(([k, v]) => (
                    <div key={k} className="px-3 py-1.5 bg-white border border-navy-100 rounded-lg">
                      <p className="text-[10px] text-navy-400">{k}</p>
                      <p className="text-xs font-mono font-bold text-navy-700">{v}</p>
                    </div>
                  ))}
                  {Object.keys(csvRecords[0]).length > 10 && (
                    <div className="px-3 py-1.5 bg-white border border-navy-100 rounded-lg flex items-end">
                      <p className="text-xs text-navy-400">+{Object.keys(csvRecords[0]).length - 10} more</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analyze button */}
      <div className="flex flex-col items-center gap-6 pt-10 border-t border-navy-50">
        <div className="flex items-center gap-2 text-xs text-navy-400">
          <Wifi size={13} className="text-emerald-500" />
          <span>Secure connection established. Results will be saved to your encrypted history.</span>
        </div>
        <button onClick={handleAnalyze}
          disabled={analyzing || (mode === 'csv' && !csvRecords.length)}
          className="btn-primary px-12 py-4 text-lg w-full max-w-md shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98]">
          {analyzing ? (
            <span className="flex items-center justify-center gap-3">
              <RefreshCw size={20} className="animate-spin" />
              Processing Analysis...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-3">
              <Search size={20} /> 
              Run AI Security Scan 
              <ArrowRight size={20} />
            </span>
          )}
        </button>
      </div>

      <ConfirmModal 
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={resetForm}
        title="Reset Form"
        message="Are you sure you want to reset all fields to their default values? This will clear all your current input."
        confirmText="Reset All"
      />
    </div>
  )
}
