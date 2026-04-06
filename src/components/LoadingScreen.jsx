import { motion } from 'motion/react'
import { memo, useState } from 'react'
import { Shield, Zap } from 'lucide-react'

const LoadingScreen = memo(() => {
  const [logoError, setLogoError] = useState(false)

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-navy-50 via-blue-50 to-indigo-50">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #3B82F6 2px, transparent 2px),
                           radial-gradient(circle at 75% 75%, #6366F1 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative flex flex-col items-center space-y-6">
        {/* Logo Container */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative"
        >
          {/* Glow effect */}
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-r from-brand-blue/20 to-purple-500/20 rounded-3xl blur-xl"
          />

          {/* Main Logo Container */}
          <div className="relative w-32 h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center border border-white/50 overflow-hidden">
            {!logoError ? (
              <motion.img
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                src="/logo.png"
                alt="ThreatGuardAI Logo"
                className="w-24 h-24 object-contain"
                onError={() => setLogoError(true)}
                referrerPolicy="no-referrer"
              />
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-col items-center justify-center"
              >
                <Shield size={32} className="text-brand-blue mb-1" />
                <Zap size={16} className="text-purple-500" />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-center"
        >
          <h2 className="text-xl font-bold text-navy-900 mb-2">ThreatGuardAI</h2>
          <p className="text-navy-600 text-sm font-medium">Initializing security systems...</p>
        </motion.div>

        {/* Loading Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.3 }}
          className="flex items-center space-x-1"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              className="w-2 h-2 bg-brand-blue rounded-full"
            />
          ))}
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "200px" }}
          transition={{ delay: 1, duration: 2, ease: "easeInOut" }}
          className="h-0.5 bg-gradient-to-r from-brand-blue to-purple-500 rounded-full"
        />
      </div>
    </div>
  )
})

LoadingScreen.displayName = 'LoadingScreen'

export default LoadingScreen
