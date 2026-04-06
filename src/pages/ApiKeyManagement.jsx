import { useState, useEffect } from 'react'
import { 
  Key, Plus, Trash2, Copy, Check, Terminal, 
  Code2, ExternalLink, Shield, Info, AlertCircle,
  Eye, EyeOff, Lock
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getApiKeys, createApiKey, deleteApiKey } from '../services/api'
import { format } from 'date-fns'
import clsx from 'clsx'
import ConfirmModal from '../components/ConfirmModal'

export default function ApiKeyManagement() {
  const { token } = useAuth()
  const toast = useToast()
  const [keys, setKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [newKeyName, setNewKeyName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [keyToDelete, setKeyToDelete] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [visibleKeys, setVisibleKeys] = useState({})

  useEffect(() => {
    loadKeys()
  }, [token])

  const loadKeys = async () => {
    setLoading(true)
    try {
      const data = await getApiKeys(token)
      setKeys(data)
    } catch (e) {
      toast.error('Failed to load API keys.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newKeyName.trim()) return
    setIsCreating(true)
    try {
      const newKey = await createApiKey(newKeyName, token)
      setKeys([newKey, ...keys])
      setNewKeyName('')
      toast.success('API key generated successfully.')
    } catch (e) {
      toast.error('Failed to generate API key.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!keyToDelete) return
    try {
      await deleteApiKey(keyToDelete.id, token)
      setKeys(keys.filter(k => k.id !== keyToDelete.id))
      toast.success('API key revoked.')
    } catch (e) {
      toast.error('Failed to revoke API key.')
    } finally {
      setShowConfirm(false)
      setKeyToDelete(null)
    }
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success('Copied to clipboard')
  }

  const toggleVisibility = (id) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const maskKey = (key) => {
    return `${key.slice(0, 8)}••••••••••••••••••••${key.slice(-4)}`
  }

  const codeSnippets = {
    curl: `curl -X POST "${window.location.origin}/api/detect/single" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "features": {
      "duration": 0,
      "src_bytes": 491,
      "dst_bytes": 0,
      "serror_rate": 0.0,
      "count": 2
    }
  }'`,
    python: `import requests

url = "${window.location.origin}/api/detect/single"
headers = {
    "X-API-Key": "YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "features": {
        "duration": 0,
        "src_bytes": 491,
        "dst_bytes": 0,
        "serror_rate": 0.0,
        "count": 2
    }
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`,
    javascript: `const response = await fetch("${window.location.origin}/api/detect/single", {
  method: "POST",
  headers: {
    "X-API-Key": "YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    features: {
      duration: 0,
      src_bytes: 491,
      dst_bytes: 0,
      serror_rate: 0.0,
      count: 2
    }
  })
});

const result = await response.json();
console.log(result);`
  }

  const [activeTab, setActiveTab] = useState('curl')

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">API Key Management</h1>
          <p className="section-subtitle mt-1">Generate and manage API keys to integrate ThreatGuardAI into your own applications.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Shield size={14} className="text-amber-600" />
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Developer Mode Active</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Key Management Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create Key Card */}
          <div className="card p-6 border-l-4 border-l-brand-blue">
            <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-brand-blue" /> Generate New API Key
            </h3>
            <form onSubmit={handleCreate} className="flex gap-3">
              <div className="flex-1 relative group">
                <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 group-focus-within:text-brand-blue transition-colors" />
                <input 
                  type="text" 
                  placeholder="e.g., Production Server, Local Script..."
                  className="input-field pl-10 h-11 text-sm"
                  value={newKeyName}
                  onChange={e => setNewKeyName(e.target.value)}
                  disabled={isCreating}
                />
              </div>
              <button 
                type="submit" 
                disabled={isCreating || !newKeyName.trim()}
                className="btn-primary px-6 h-11 text-sm whitespace-nowrap shadow-glow-sm"
              >
                {isCreating ? 'Generating...' : 'Generate Key'}
              </button>
            </form>
            <p className="text-[10px] text-navy-400 mt-3 flex items-center gap-1.5">
              <Info size={12} /> API keys grant full access to your detection history and scanning capabilities. Never share them.
            </p>
          </div>

          {/* Keys List */}
          <div className="card p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-navy-50 flex items-center justify-between bg-navy-50/30">
              <h3 className="font-bold text-navy-900 text-sm">Your Active API Keys</h3>
              <span className="px-2 py-0.5 bg-white border border-navy-100 rounded-lg text-[10px] font-bold text-navy-500">
                {keys.length} Keys
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Key Name</th>
                    <th>API Key</th>
                    <th>Created</th>
                    <th>Last Used</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan="5" className="py-6">
                          <div className="h-4 bg-navy-50 rounded-full w-full" />
                        </td>
                      </tr>
                    ))
                  ) : keys.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center">
                        <div className="flex flex-col items-center text-navy-300">
                          <Lock size={32} className="mb-3 opacity-20" />
                          <p className="font-bold text-navy-900">No API keys generated</p>
                          <p className="text-xs mt-1">Generate a key above to start using the API.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    keys.map((key) => (
                      <tr key={key.id} className="group hover:bg-navy-50/50 transition-colors">
                        <td>
                          <p className="text-sm font-bold text-navy-900">{key.keyName}</p>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <code className="text-[11px] font-mono bg-navy-50 px-2 py-1 rounded border border-navy-100 text-navy-600">
                              {visibleKeys[key.id] ? key.apiKey : maskKey(key.apiKey)}
                            </code>
                            <button 
                              onClick={() => toggleVisibility(key.id)}
                              className="p-1.5 text-navy-400 hover:text-navy-900 transition-colors"
                            >
                              {visibleKeys[key.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <button 
                              onClick={() => copyToClipboard(key.apiKey, key.id)}
                              className="p-1.5 text-navy-400 hover:text-brand-blue transition-colors"
                            >
                              {copiedId === key.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </td>
                        <td>
                          <p className="text-xs text-navy-500">{key.createdAt ? format(new Date(key.createdAt), 'MMM d, yyyy') : '—'}</p>
                        </td>
                        <td>
                          <p className="text-xs text-navy-500">
                            {key.lastUsed ? format(new Date(key.lastUsed), 'MMM d, HH:mm') : 'Never'}
                          </p>
                        </td>
                        <td className="text-right">
                          <button 
                            onClick={() => {
                              setKeyToDelete(key)
                              setShowConfirm(true)
                            }}
                            className="p-2 text-navy-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Documentation Section */}
        <div className="space-y-6">
          <div className="card p-6 bg-navy-900 text-white border-none shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Terminal size={120} />
            </div>
            <h3 className="font-bold text-white mb-6 flex items-center gap-2 relative z-10">
              <Code2 size={18} className="text-brand-blue" /> Quick Integration
            </h3>
            
            <div className="flex gap-1 mb-4 relative z-10">
              {['curl', 'python', 'javascript'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all',
                    activeTab === tab 
                      ? 'bg-brand-blue text-white shadow-glow-sm' 
                      : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative z-10">
              <div className="bg-black/40 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-blue-100 overflow-x-auto border border-white/10 group">
                <button 
                  onClick={() => copyToClipboard(codeSnippets[activeTab], 'snippet')}
                  className="absolute top-2 right-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                >
                  {copiedId === 'snippet' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
                <pre className="whitespace-pre-wrap">{codeSnippets[activeTab]}</pre>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 relative z-10">
              <h4 className="text-[10px] font-black text-navy-400 uppercase tracking-widest mb-3">API Endpoints</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-bold">POST</span>
                  <span className="text-white/60">/api/detect/single</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-bold">POST</span>
                  <span className="text-white/60">/api/detect/batch</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-blue-400 font-bold">GET</span>
                  <span className="text-white/60">/api/detect/history</span>
                </div>
              </div>
              <button className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                Full API Documentation <ExternalLink size={12} />
              </button>
            </div>
          </div>

          <div className="card p-6 border-l-4 border-l-amber-400 bg-amber-50/30">
            <h3 className="font-bold text-navy-900 text-sm mb-2 flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-500" /> Security Warning
            </h3>
            <p className="text-xs text-navy-600 leading-relaxed">
              API keys provide full access to your account's detection engine. If a key is compromised, revoke it immediately and generate a new one.
            </p>
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Revoke API Key"
        message={`Are you sure you want to revoke the API key "${keyToDelete?.keyName}"? Any applications using this key will immediately lose access to the ThreatGuardAI API.`}
        confirmText="Revoke Key"
        type="danger"
      />
    </div>
  )
}
