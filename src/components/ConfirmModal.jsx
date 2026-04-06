import { motion, AnimatePresence } from 'motion/react'
import { AlertTriangle, X } from 'lucide-react'
import clsx from 'clsx'

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Are you sure?', 
  message = 'This action cannot be undone.', 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  type = 'danger' 
}) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-navy-100"
        >
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className={clsx(
                'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0',
                type === 'danger' ? 'bg-red-50 text-red-600' : 'bg-brand-blue/10 text-brand-blue'
              )}>
                <AlertTriangle size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-navy-900">{title}</h3>
                  <button onClick={onClose} className="text-navy-300 hover:text-navy-600 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <p className="text-sm text-navy-500 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button 
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-navy-600 bg-navy-50 hover:bg-navy-100 transition-all border border-navy-100"
              >
                {cancelText}
              </button>
              <button 
                onClick={() => {
                  onConfirm()
                  onClose()
                }}
                className={clsx(
                  'flex-1 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg',
                  type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' : 'bg-brand-blue hover:bg-blue-600 shadow-brand-blue/20'
                )}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
