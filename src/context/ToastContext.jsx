import { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', title = '') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type, title }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const success = (m, t) => addToast(m, 'success', t)
  const error   = (m, t) => addToast(m, 'error', t)
  const info    = (m, t) => addToast(m, 'info', t)
  const warning = (m, t) => addToast(m, 'warning', t)

  return (
    <ToastContext.Provider value={{ addToast, success, error, info, warning }}>
      {children}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onRemove }) {
  const icons = {
    success: <CheckCircle2 className="text-emerald-500" size={20} />,
    error:   <AlertCircle className="text-red-500" size={20} />,
    info:    <Info className="text-brand-blue" size={20} />,
    warning: <AlertTriangle className="text-amber-500" size={20} />,
  }

  const colors = {
    success: 'border-emerald-100 bg-emerald-50',
    error:   'border-red-100 bg-red-50',
    info:    'border-blue-100 bg-blue-50',
    warning: 'border-amber-100 bg-amber-50',
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      className={`pointer-events-auto w-80 p-4 rounded-2xl border shadow-lg flex gap-3 ${colors[toast.type]}`}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        {toast.title && <p className="text-sm font-bold text-navy-900 mb-0.5">{toast.title}</p>}
        <p className="text-xs text-navy-600 leading-relaxed">{toast.message}</p>
      </div>
      <button onClick={onRemove} className="flex-shrink-0 text-navy-300 hover:text-navy-600 transition-colors h-fit">
        <X size={16} />
      </button>
    </motion.div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
