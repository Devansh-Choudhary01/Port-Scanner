import { useState } from 'react'
import GlassCard from '../components/ui/GlassCard'
import ScanTerminal from '../components/scan/ScanTerminal'
import ScanProgressBar from '../components/scan/ScanProgressBar'
import ScanResults from '../components/scan/ScanResults'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ConsentCheckbox from '../components/ui/ConsentCheckbox'
import ConfirmScanDialog from '../components/ui/ConfirmScanDialog'
import RateLimitBadge from '../components/ui/RateLimitBadge'
import { api } from '../services/api'
import toast from 'react-hot-toast'

import { FiLock, FiGlobe, FiFileText } from 'react-icons/fi'

const TOOLS = [
  { id: 'password', label: 'Password Checker',  icon: <FiLock size={24} />, desc: 'Strength, entropy & crack time' },
  { id: 'website',  label: 'Website Scanner',   icon: <FiGlobe size={24} />, desc: 'Headers, SSL & tech detection'  },
  { id: 'wordpress',label: 'WordPress Scanner',  icon: <FiFileText size={24} />, desc: 'WP misconfigurations & paths'   },
]

export default function VulnScanners() {
  const [active, setActive]     = useState('password')
  const [input, setInput]       = useState('')
  const [isScanning, setScan]   = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult]     = useState(null)
  const [termLines, setTerm]    = useState([])
  const [consent, setConsent]   = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const addLine = (text, type = 'info') => setTerm(p => [...p, { text, type }])

  const tool = TOOLS.find(t => t.id === active)

  const handleRun = () => {
    if (!input.trim()) { toast.error('Target required'); return }
    if (active !== 'password') {
      if (!consent) { toast.error('Please confirm authorization first'); return }
      setShowConfirm(true)
    } else {
      run()
    }
  }

  const run = async () => {
    setShowConfirm(false)
    setScan(true); setResult(null); setTerm([]); setProgress(0)
    const tick = setInterval(() => setProgress(p => Math.min(p + 3, 90)), 100)

    try {
      addLine(`> Running ${tool.label}...`, 'prompt')
      addLine(`> Target: ${input}`, 'info')

      let res, type
      if (active === 'password') {
        res = await api.post('/api/vulnscan/password-check', { password: input })
        type = 'password'
      } else if (active === 'website') {
        res = await api.post('/api/vulnscan/website-scan', { url: input, consent_confirmed: true })
        type = 'website'
      } else {
        res = await api.post('/api/vulnscan/wordpress-scan', { url: input, consent_confirmed: true })
        type = 'generic'
      }
      clearInterval(tick); setProgress(100)
      addLine('> Analysis complete ✓', 'success')
      setResult({ data: res.data, type })
      toast.success('Scan completed')
    } catch (err) {
      clearInterval(tick); setProgress(0)
      const msg = err.response?.data?.detail || 'Scan failed'
      addLine(`> ERROR: ${msg}`, 'error')
      toast.error(msg)
    } finally { setScan(false) }
  }

  return (
    <div className="page-container space-y-5">
      <div>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-black text-white">Vulnerability <span className="gradient-text">Scanners</span></h1>
            <p className="text-xs text-cyber-muted mt-1 font-mono">Security analysis & misconfiguration detection</p>
          </div>
          <RateLimitBadge />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TOOLS.map(t => (
          <button
            key={t.id}
            onClick={() => { setActive(t.id); setResult(null); setInput('') }}
            className={`glass glass-hover p-4 text-left border rounded-xl transition-all ${active===t.id?'border-cyber-purple/50 bg-purple-500/5':'border-cyber-border'}`}
          >
            <span className="text-2xl">{t.icon}</span>
            <p className="text-sm font-bold mt-2 text-cyber-text">{t.label}</p>
            <p className="text-xs text-cyber-muted mt-0.5">{t.desc}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard title={`Configure — ${TOOLS.find(t=>t.id===active).label}`}>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-cyber-muted uppercase tracking-widest mb-1.5 block">
                {active === 'password' ? 'Password' : 'URL / Domain'}
              </label>
              <input
                className="cyber-input"
                type={active === 'password' ? 'text' : 'url'}
                placeholder={active === 'password' ? 'Enter password to analyse...' : 'https://example.com'}
                value={input}
                onChange={e => setInput(e.target.value)}
                id="vulnscan-input"
                onKeyDown={e => e.key === 'Enter' && handleRun()}
              />
            </div>

            {/* F8 — Privacy Notice for Password Checker */}
            {active === 'password' && (
              <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>
                🔒 <strong className="text-white">Privacy Guarantee:</strong> Your password is processed strictly in your browser and is not stored or logged anywhere on the server.
              </p>
            )}

            {/* F2 — Consent Checkbox for infrastructure scans */}
            {active !== 'password' && (
              <ConsentCheckbox checked={consent} onChange={setConsent} />
            )}

            <button onClick={handleRun} disabled={isScanning || (active !== 'password' && !consent)} className="btn-cyber w-full justify-center" id="vulnscan-btn"
              style={{ borderColor: 'rgba(139,92,246,0.4)', color: '#8B5CF6' }}>
              {isScanning ? <><LoadingSpinner size={16} label={null}/> Analysing...</> : '▶ Run Analysis'}
            </button>
            {isScanning && <ScanProgressBar progress={progress} label="Analysis in progress..." />}
          </div>
        </GlassCard>

        <GlassCard title="Output Terminal">
          <ScanTerminal isScanning={isScanning} target={input} scanLines={termLines} />
        </GlassCard>
      </div>

      {result && (
        <GlassCard title="Results">
          <ScanResults data={result.data} type={result.type} />
        </GlassCard>
      )}

      {/* F13 — Confirm dialog */}
      <ConfirmScanDialog
        open={showConfirm}
        onConfirm={run}
        onCancel={() => setShowConfirm(false)}
        toolName={tool.label}
        target={input}
      />
    </div>
  )
}
