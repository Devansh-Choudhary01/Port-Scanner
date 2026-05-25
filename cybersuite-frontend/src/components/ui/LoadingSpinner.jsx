import { motion } from 'framer-motion'

export default function LoadingSpinner({ size = 40, label = 'Scanning...' }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="rounded-full border-2 border-cyber-border border-t-cyber-cyan"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: '2px solid rgba(30,45,74,0.6)',
          borderTopColor: '#00D4FF',
          boxShadow: '0 0 12px rgba(0,212,255,0.4)',
        }}
      />
      {label && (
        <p className="text-xs font-mono text-cyber-muted animate-pulse">{label}</p>
      )}
    </div>
  )
}
