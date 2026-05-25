import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const COLORS = {
  cyan:   { text: 'text-cyber-cyan',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20',   shadow: 'shadow-neon-cyan' },
  green:  { text: 'text-cyber-green',  bg: 'bg-green-500/10',  border: 'border-green-500/20',  shadow: 'shadow-neon-green' },
  red:    { text: 'text-cyber-red',    bg: 'bg-red-500/10',    border: 'border-red-500/20',    shadow: 'shadow-neon-red' },
  purple: { text: 'text-cyber-purple', bg: 'bg-purple-500/10', border: 'border-purple-500/20', shadow: 'shadow-neon-purple' },
  orange: { text: 'text-cyber-orange', bg: 'bg-orange-500/10', border: 'border-orange-500/20', shadow: '' },
}

function useCounter(target, duration = 1200) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    const isNum = typeof target === 'number'
    if (!isNum) { ref.current.textContent = target; return }
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start = Math.min(start + step, target)
      if (ref.current) ref.current.textContent = Math.floor(start).toLocaleString()
      if (start >= target) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return ref
}

export default function StatCard({ label, value, icon: Icon, color = 'cyan', trend, suffix = '', delay = 0 }) {
  const c = COLORS[color] || COLORS.cyan
  const counterRef = useCounter(typeof value === 'number' ? value : 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`glass glass-hover p-5 border ${c.border} relative overflow-hidden`}
    >
      {/* Background glow */}
      <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full ${c.bg} blur-2xl pointer-events-none`} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyber-muted">{label}</p>
          <div className={`p-2 rounded-lg ${c.bg} border ${c.border}`}>
            <Icon size={16} className={c.text} />
          </div>
        </div>

        <div className="flex items-end gap-2">
          <p className={`text-3xl font-black ${c.text}`}>
            {typeof value === 'number'
              ? <span ref={counterRef}>0</span>
              : value}
            {suffix && <span className="text-lg ml-1">{suffix}</span>}
          </p>
        </div>

        {trend !== undefined && (
          <p className={`text-xs mt-2 font-medium ${trend >= 0 ? 'text-cyber-green' : 'text-cyber-red'}`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% vs last hour
          </p>
        )}
      </div>
    </motion.div>
  )
}
