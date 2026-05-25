import { motion } from 'framer-motion'

export default function ScanProgressBar({ progress = 0, label = 'Scanning...' }) {
  const pct = Math.min(100, Math.max(0, progress))
  const color = pct < 30 ? '#00D4FF' : pct < 70 ? '#8B5CF6' : '#00FF88'

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-cyber-muted font-mono">{label}</span>
        <span className="text-xs font-bold font-mono" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2 bg-cyber-border rounded-full overflow-hidden">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="h-full rounded-full relative"
          style={{
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 12px ${color}60`,
          }}
        >
          {/* Shimmer effect */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
              animation: 'skeleton-loading 1.5s infinite',
            }}
          />
        </motion.div>
      </div>
    </div>
  )
}
