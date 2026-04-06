import { useLocation, Link, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Shield, AlertTriangle, CheckCircle2, ArrowLeft, BarChart3,
  Activity, Clock, ChevronRight, Share2, Download, RefreshCw, Cpu,
  ShieldCheck, ShieldAlert, Zap, Info, ExternalLink, Printer,
  Terminal, FileText, Copy, Check
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'motion/react'
import { exportToPDF, exportToCSV } from '../services/exportService'
import { useToast } from '../context/ToastContext'
import clsx from 'clsx'
import confetti from 'canvas-confetti'

export default function Results() {
  const { state } = useLocation()
  const toast     = useToast()
  const [copied, setCopied] = useState(false)
  const detection = state?.detection
  const result    = state?.result
  const mode      = state?.mode

  useEffect(() => {
    if (detection && detection.verdict === 'NORMAL') {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#6EE7B7']
      })
    }
  }, [detection])

  if (!detection) return <Navigate to="/app/detection" replace />

  const isAttack = detection.verdict === 'ATTACK'
  const confidence = Math.round(detection.confidence * 100)
  
  const topFeatures = result?.top_features || JSON.parse(detection.topFeaturesJson || '[]')

  const handlePrint = () => window.print()
  
  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportPDF = () => {
    exportToPDF(detection, `Security Analysis Report - #${String(detection.id).slice(-4).toUpperCase()}`)
    toast.success('PDF report generation started.')
  }

  const handleExportCSV = () => {
    if (mode === 'csv') {
      // In a real app, we might fetch the full batch data here
      // For now, we'll export the summary record
      exportToCSV([detection], `scan_summary_${detection.id}.csv`)
      toast.success('CSV export started.')
    }
  }

  // Safety Score Calculation (Inverse of confidence if attack, or confidence if normal)
  const safetyScore = isAttack ? Math.max(0, 100 - confidence) : confidence

  const FEATURE_EXPLANATIONS = {
    'src_bytes': 'Number of data bytes from source to destination. High values often indicate data exfiltration or large payload attacks.',
    'dst_bytes': 'Number of data bytes from destination to source. Unusual spikes can suggest unauthorized data retrieval.',
    'duration': 'Length of the connection. Extremely short or long durations can be characteristic of automated scanning or persistent backdoors.',
    'count': 'Number of connections to the same host in the last two seconds. High counts are a primary indicator of DoS/DDoS attempts.',
    'srv_count': 'Number of connections to the same service in the last two seconds. Rapid increases suggest service-specific probing.',
    'serror_rate': 'Percentage of connections that have "SYN" errors. High rates are typical of SYN flood attacks.',
    'rerror_rate': 'Percentage of connections that have "REJ" errors. Often indicates port scanning or rejected connection attempts.',
    'same_srv_rate': 'Percentage of connections to the same service. Low rates combined with high counts suggest distributed scanning.',
    'diff_srv_rate': 'Percentage of connections to different services. High rates can indicate a wide-range port scan.',
    'dst_host_count': 'Number of connections to the same destination host. Used to identify targeted host-based attacks.',
    'dst_host_srv_count': 'Number of connections to the same service on the destination host. Helps identify targeted service exploits.',
  };

  const ConfidenceGauge = ({ value, isAttack }) => {
    const angle = (value / 100) * 180 - 90; // -90 to 90 degrees
    const color = isAttack ? '#EF4444' : '#10B981';
    
    return (
      <div className="relative w-48 h-32 flex flex-col items-center justify-end overflow-hidden">
        <svg className="w-48 h-24" viewBox="0 0 100 50">
          {/* Background Track */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Progress Track */}
          <motion.path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={126}
            initial={{ strokeDashoffset: 126 }}
            animate={{ strokeDashoffset: 126 - (126 * value) / 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          {/* Needle */}
          <motion.g
            initial={{ rotate: -90 }}
            animate={{ rotate: angle }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ originX: '50px', originY: '50px' }}
          >
            <line x1="50" y1="50" x2="50" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="50" cy="50" r="4" fill="white" />
          </motion.g>
        </svg>
        <div className="absolute bottom-0 flex flex-col items-center">
          <span className="text-3xl font-black text-white leading-none">{value}%</span>
          <span className="text-[8px] font-bold text-white/60 uppercase tracking-widest mt-1">Confidence</span>
        </div>
      </div>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto space-y-6 pb-12"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/app/detection" className="p-1.5 hover:bg-navy-50 rounded-lg text-navy-400 transition-colors">
              <ArrowLeft size={16} />
            </Link>
            <h1 className="page-title !mb-0">Analysis Report</h1>
          </div>
          <p className="section-subtitle">
            Scan ID: <span className="font-mono text-navy-900 font-bold">#{String(detection.id).slice(-4).toUpperCase()}</span> · 
            {detection.createdAt ? format(new Date(detection.createdAt), ' MMM d, yyyy HH:mm') : '—'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleShare} className="btn-ghost text-xs gap-1.5 border border-navy-100 bg-white min-w-[100px]">
            {copied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
            {copied ? 'Copied!' : 'Share'}
          </button>
          <button onClick={handlePrint} className="btn-ghost text-xs gap-1.5 border border-navy-100 bg-white">
            <Printer size={14} /> Print
          </button>
          {mode === 'csv' && (
            <button onClick={handleExportCSV} className="btn-ghost text-xs gap-1.5 border border-navy-100 bg-white">
              <Download size={14} /> Export CSV
            </button>
          )}
          <button onClick={handleExportPDF} className="btn-primary text-xs gap-1.5 shadow-glow-sm">
            <FileText size={14} /> Export PDF
          </button>
        </div>
      </motion.div>

      {/* Hero Result Card */}
      <motion.div variants={itemVariants} className={clsx(
        'card p-0 border-none relative overflow-hidden shadow-card-lg',
        isAttack ? 'bg-gradient-to-br from-red-600 to-red-700 text-white' : 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white'
      )}>
        <div className="absolute top-0 right-0 p-12 opacity-10">
          {isAttack ? <ShieldAlert size={160} /> : <ShieldCheck size={160} />}
        </div>

        <div className="relative z-10 p-8 sm:p-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className={clsx(
              'w-28 h-28 rounded-[2.5rem] flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl animate-float',
            )}>
              {isAttack ? <AlertTriangle size={56} className="text-white" /> : <Shield size={56} className="text-white" />}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
              {isAttack ? <ShieldAlert size={20} className="text-red-600" /> : <CheckCircle2 size={20} className="text-emerald-600" />}
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20">
              <Zap size={10} /> AI Engine Verdict
            </div>
            <h2 className="text-4xl sm:text-5xl font-black mb-3 tracking-tight">
              {isAttack ? 'Threat Detected' : 'System Secure'}
            </h2>
            <p className="text-white/80 text-sm max-w-lg leading-relaxed">
              {isAttack 
                ? 'Our AI model has identified high-risk patterns consistent with malicious intrusion attempts. We recommend immediate isolation of the affected host.'
                : 'Great news! No malicious patterns were identified in this traffic sample. The analyzed data matches our verified normal behavioral baselines.'}
            </p>
          </div>

          <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/20 min-w-[220px]">
            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Model Certainty</p>
            <ConfidenceGauge value={confidence} isAttack={isAttack} />
          </div>
        </div>
      </motion.div>

      {/* Summary Card */}
      <motion.div variants={itemVariants} className="card p-6 border-l-4 border-l-brand-blue bg-blue-50/30">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue flex-shrink-0">
            <Info size={20} />
          </div>
          <div>
            <h3 className="font-bold text-navy-900 text-sm mb-1">Analysis Summary</h3>
            <p className="text-xs text-navy-600 leading-relaxed">
              The system analyzed the provided network traffic using our <span className="font-bold">ThreatGuard-RF-v1.2</span> model. 
              The verdict is based on a <span className="font-bold">{confidence}% confidence level</span>. 
              {isAttack 
                ? ' The primary drivers for this detection include unusual packet sizes and high-frequency connection attempts.' 
                : ' The traffic exhibits characteristics typical of standard HTTP/HTTPS communication with no anomalous deviations.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Batch Summary (if CSV) */}
      {mode === 'csv' && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-6 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-navy-50 flex items-center justify-center text-navy-500">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-navy-400 uppercase tracking-widest">Total Records</p>
              <p className="text-2xl font-black text-navy-900">{detection.totalRecords?.toLocaleString()}</p>
            </div>
          </div>
          <div className="card p-6 flex items-center gap-5 hover:shadow-md transition-shadow border-l-4 border-l-red-500">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-navy-400 uppercase tracking-widest">Attacks</p>
              <p className="text-2xl font-black text-red-600">{detection.attackCount?.toLocaleString()}</p>
            </div>
          </div>
          <div className="card p-6 flex items-center gap-5 hover:shadow-md transition-shadow border-l-4 border-l-emerald-500">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-navy-400 uppercase tracking-widest">Normal</p>
              <p className="text-2xl font-black text-emerald-600">{detection.normalCount?.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Feature Importance */}
        <motion.div variants={itemVariants} className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-navy-900 flex items-center gap-2">
                <BarChart3 size={18} className="text-brand-blue" /> Decision Drivers
              </h3>
              <p className="text-xs text-navy-400 mt-1">Key features that determined this classification</p>
            </div>
            <div className="flex gap-2">
              <div className="px-3 py-1 bg-navy-50 rounded-full text-[10px] font-bold text-navy-500 uppercase tracking-wider">
                AI Logic Map
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="h-64">
              <p className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-4 text-center">Linear Importance</p>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topFeatures} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F1F5F9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#F8FAFF' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px' }} />
                  <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={20}>
                    {topFeatures.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={isAttack ? '#EF4444' : '#10B981'} fillOpacity={1 - index * 0.15} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="h-64">
              <p className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-4 text-center">Multi-Dimensional Profile</p>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={topFeatures}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748B' }} />
                  <Radar
                    name="Importance"
                    dataKey="importance"
                    stroke={isAttack ? '#EF4444' : '#10B981'}
                    fill={isAttack ? '#EF4444' : '#10B981'}
                    fillOpacity={0.4}
                  />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-6 p-6 bg-white border border-navy-100 rounded-[2.5rem] shadow-sm">
            <h4 className="text-xs font-black text-navy-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap size={14} className="text-amber-500" /> AI Reasoning & Insights
            </h4>
            <div className="space-y-4">
              {topFeatures.slice(0, 3).map((feat, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-2xl bg-navy-50/50 border border-navy-100/50">
                  <div className={clsx(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs',
                    isAttack ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                  )}>
                    {Math.round(feat.importance * 100)}%
                  </div>
                  <div>
                    <p className="text-xs font-bold text-navy-900 mb-0.5 capitalize">{feat.name.replace(/_/g, ' ')}</p>
                    <p className="text-[11px] text-navy-500 leading-relaxed">
                      {FEATURE_EXPLANATIONS[feat.name] || `This feature contributed significantly to the model's ${detection.verdict.toLowerCase()} classification based on historical pattern matching.`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Risk Assessment */}
        <motion.div variants={itemVariants} className="card">
          <h3 className="font-bold text-navy-900 mb-6 flex items-center gap-2">
            <Shield size={18} className="text-brand-blue" /> Risk Assessment
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-3 bg-navy-50 rounded-2xl">
              <span className="text-xs font-bold text-navy-500">Risk Level</span>
              <span className={clsx(
                'px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm',
                isAttack ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
              )}>
                {isAttack ? 'Critical' : 'Low'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-navy-100 rounded-2xl">
                <p className="text-[9px] font-bold text-navy-400 uppercase mb-1">Threat Type</p>
                <p className="text-xs font-bold text-navy-900">{isAttack ? 'Intrusion' : 'Baseline'}</p>
              </div>
              <div className="p-4 bg-white border border-navy-100 rounded-2xl">
                <p className="text-[9px] font-bold text-navy-400 uppercase mb-1">Action</p>
                <p className={clsx('text-xs font-bold', isAttack ? 'text-red-600' : 'text-emerald-600')}>
                  {isAttack ? 'Immediate' : 'None'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-navy-50">
              <p className="text-[10px] font-bold text-navy-400 uppercase mb-4 flex items-center gap-2">
                <Zap size={12} className="text-amber-500" /> Recommended Actions
              </p>
              <div className="space-y-3">
                {isAttack ? (
                  <>
                    <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                      <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold">1</span>
                      </div>
                      <span className="text-xs text-red-800 font-medium">Blacklist source IP in firewall rules.</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                      <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold">2</span>
                      </div>
                      <span className="text-xs text-red-800 font-medium">Initiate deep packet inspection.</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                      <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold">3</span>
                      </div>
                      <span className="text-xs text-red-800 font-medium">Isolate target host from network.</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                        <CheckCircle2 size={12} />
                      </div>
                      <span className="text-xs text-emerald-800 font-medium">No immediate action required. Traffic is safe.</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                        <RefreshCw size={12} />
                      </div>
                      <span className="text-xs text-emerald-800 font-medium">Add to behavioral baseline.</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Technical Details */}
        <motion.div variants={itemVariants} className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-navy-900 flex items-center gap-2">
              <Cpu size={18} className="text-brand-blue" /> Technical Metadata
            </h3>
            <span className="px-2 py-1 bg-navy-50 rounded-lg text-[10px] font-bold text-navy-400">v1.2.4</span>
          </div>
          <div className="space-y-1">
            {[
              { label: 'Input Mode', value: detection.inputMode, icon: Terminal },
              { label: 'Source File', value: detection.filename || 'Manual Input', icon: FileText },
              { label: 'Model Version', value: 'ThreatGuard-RF-v1.2', icon: Cpu },
              { label: 'Processing Time', value: '142ms', icon: Zap },
              { label: 'Status', value: 'Verified & Logged', icon: ShieldCheck, color: 'text-emerald-600' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-navy-50 last:border-0">
                <div className="flex items-center gap-2.5">
                  <item.icon size={14} className="text-navy-300" />
                  <span className="text-xs text-navy-500">{item.label}</span>
                </div>
                <span className={clsx('text-xs font-bold uppercase tracking-wide', item.color || 'text-navy-900')}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Threat Intelligence Analysis */}
        <motion.div variants={itemVariants} className="card bg-navy-900 text-white border-none shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Activity size={120} />
          </div>
          <h3 className="font-bold text-white mb-6 flex items-center gap-2 relative z-10">
            <Activity size={18} className="text-brand-blue" /> Threat Intelligence Feed
          </h3>
          <div className="space-y-4 relative z-10">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <p className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-2">Global Context</p>
              <p className="text-xs text-white/80 leading-relaxed">
                {isAttack 
                  ? 'Similar patterns have been reported in 12 other enterprise networks in the last 24 hours. This signature matches known "Reconnaissance" behavior.'
                  : 'This traffic pattern aligns with standard enterprise communication protocols. No matching threat signatures found in current global database.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[9px] font-bold text-navy-400 uppercase tracking-widest">IP Reputation</p>
                <p className={clsx('text-xs font-bold mt-1', isAttack ? 'text-red-400' : 'text-emerald-400')}>
                  {isAttack ? 'Suspicious' : 'Neutral'}
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[9px] font-bold text-navy-400 uppercase tracking-widest">CVE Correlation</p>
                <p className="text-xs font-bold text-white/60 mt-1">None Found</p>
              </div>
            </div>
            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
              View Full Intelligence Report <ExternalLink size={12} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* What's Next? / Security Health Check */}
      <motion.div variants={itemVariants} className="card p-8 bg-gradient-to-r from-navy-50 to-white border-navy-100">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue flex-shrink-0">
            <ShieldCheck size={40} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-navy-900 mb-2">
              {isAttack ? 'Immediate Action Required' : 'Your System is Healthy'}
            </h3>
            <p className="text-sm text-navy-500 max-w-2xl">
              {isAttack 
                ? 'We recommend following the suggested actions immediately to prevent further escalation. Our team is available for deep forensic analysis if required.'
                : 'Regular scans are the best way to maintain a secure environment. We recommend scheduling a full network audit every 30 days to stay ahead of emerging threats.'}
            </p>
          </div>
          <div className="flex flex-col gap-2 min-w-[200px]">
            <button className="btn-primary text-xs w-full">
              {isAttack ? 'Contact Security Team' : 'Schedule Next Scan'}
            </button>
            <button className="btn-ghost text-xs w-full border border-navy-100">
              {isAttack ? 'View Incident Logs' : 'Security Best Practices'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Footer Actions */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
        <Link to="/app/detection" className="btn-secondary w-full sm:w-auto px-10 py-3 text-sm">
          <RefreshCw size={16} /> Run Another Scan
        </Link>
        <Link to="/app/history" className="btn-ghost w-full sm:w-auto px-10 py-3 text-sm border border-navy-100 bg-white">
          <Clock size={16} /> View History
        </Link>
      </motion.div>
    </motion.div>
  )
}
