import { useState } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '../components/ui/GlassCard'
import NeonBadge from '../components/ui/NeonBadge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { api } from '../services/api'
import toast from 'react-hot-toast'
import { FiDownload, FiPlus, FiTrash2 } from 'react-icons/fi'

const RISK_LEVELS = ['none','low','medium','high','critical']

const TOOL_OPTIONS = [
  'Port Scanner','Subdomain Finder','WHOIS Lookup','DNS Lookup','Network Scanner',
  'Password Checker','Website Scanner','WordPress Scanner','SQL Injection Tester','XSS Tester',
]

function ScanEntry({ entry, onRemove }) {
  return (
    <div className="flex items-start gap-3 p-3 glass rounded-lg border border-cyber-border">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-cyber-text">{entry.tool}</span>
          <NeonBadge level={entry.risk_level}>{entry.risk_level}</NeonBadge>
        </div>
        <p className="text-xs text-cyber-muted mt-0.5 font-mono">{entry.target}</p>
        <ul className="mt-1 space-y-0.5">
          {entry.findings.map((f, i) => (
            <li key={i} className="text-xs text-cyber-muted">• {f}</li>
          ))}
        </ul>
      </div>
      <button onClick={onRemove} className="text-cyber-muted hover:text-cyber-red transition-colors">
        <FiTrash2 size={14} />
      </button>
    </div>
  )
}

export default function ReportGenerator() {
  const [title, setTitle]   = useState('Security Assessment Report')
  const [target, setTarget] = useState('')
  const [analyst, setAnalyst] = useState('')
  const [summary, setSummary] = useState('')
  const [scans, setScans]   = useState([])
  const [newTool, setNewTool] = useState(TOOL_OPTIONS[0])
  const [newTarget, setNewTarget] = useState('')
  const [newRisk, setNewRisk]   = useState('none')
  const [newFindings, setNewFindings] = useState('')
  const [generating, setGen] = useState(false)

  const addScan = () => {
    if (!newTarget.trim()) { toast.error('Target required'); return }
    setScans(prev => [...prev, {
      tool: newTool,
      target: newTarget,
      timestamp: new Date().toISOString(),
      risk_level: newRisk,
      findings: newFindings.split('\n').filter(Boolean),
    }])
    setNewTarget(''); setNewFindings(''); setNewRisk('none')
    toast.success('Scan entry added')
  }

  const generate = async () => {
    if (!target.trim()) { toast.error('Report target required'); return }
    if (scans.length === 0) { toast.error('Add at least one scan entry'); return }
    setGen(true)
    try {
      const res = await api.post('/api/reports/generate', {
        title,
        target,
        analyst: analyst || undefined,
        executive_summary: summary || undefined,
        scans,
        include_recommendations: true,
      }, { responseType: 'blob' })

      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url
      a.download = `CyberSuite_Report_${Date.now()}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Report downloaded!')
    } catch {
      toast.error('Report generation failed — is the backend running?')
    } finally { setGen(false) }
  }

  return (
    <div className="page-container space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">Report <span className="gradient-text">Generator</span></h1>
        <p className="text-xs text-cyber-muted mt-1 font-mono">Generate professional PDF security assessment reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Report Details */}
        <GlassCard title="Report Details" delay={0.05}>
          <div className="space-y-3">
            {[
              { label:'Report Title', val: title, set: setTitle, ph: 'Security Assessment Report', id:'report-title' },
              { label:'Target',       val: target, set: setTarget, ph: 'example.com', id:'report-target' },
              { label:'Analyst',      val: analyst, set: setAnalyst, ph: 'Your name (optional)', id:'report-analyst' },
            ].map(({ label, val, set, ph, id }) => (
              <div key={id}>
                <label className="text-xs text-cyber-muted uppercase tracking-widest mb-1.5 block">{label}</label>
                <input className="cyber-input" value={val} onChange={e => set(e.target.value)} placeholder={ph} id={id} />
              </div>
            ))}
            <div>
              <label className="text-xs text-cyber-muted uppercase tracking-widest mb-1.5 block">Executive Summary</label>
              <textarea
                className="cyber-input resize-none"
                rows={3}
                placeholder="Optional executive summary..."
                value={summary}
                onChange={e => setSummary(e.target.value)}
                id="report-summary"
              />
            </div>
          </div>
        </GlassCard>

        {/* Add Scan Entry */}
        <GlassCard title="Add Scan Entry" delay={0.1}>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-cyber-muted uppercase tracking-widest mb-1.5 block">Tool</label>
              <select className="cyber-input" value={newTool} onChange={e => setNewTool(e.target.value)} id="report-tool">
                {TOOL_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-cyber-muted uppercase tracking-widest mb-1.5 block">Target</label>
                <input className="cyber-input" value={newTarget} onChange={e => setNewTarget(e.target.value)} placeholder="example.com" id="report-entry-target" />
              </div>
              <div>
                <label className="text-xs text-cyber-muted uppercase tracking-widest mb-1.5 block">Risk Level</label>
                <select className="cyber-input" value={newRisk} onChange={e => setNewRisk(e.target.value)} id="report-risk">
                  {RISK_LEVELS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-cyber-muted uppercase tracking-widest mb-1.5 block">Findings (one per line)</label>
              <textarea className="cyber-input resize-none" rows={3} value={newFindings} onChange={e => setNewFindings(e.target.value)} placeholder="Finding 1&#10;Finding 2" id="report-findings" />
            </div>
            <button onClick={addScan} className="btn-cyber w-full justify-center" id="report-add-btn">
              <FiPlus size={14}/> Add Entry
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Entries */}
      {scans.length > 0 && (
        <GlassCard title={`Scan Entries (${scans.length})`} delay={0.15}>
          <div className="space-y-2">
            {scans.map((s, i) => (
              <ScanEntry key={i} entry={s} onRemove={() => setScans(prev => prev.filter((_,j)=>j!==i))} />
            ))}
          </div>
          <button
            onClick={generate}
            disabled={generating}
            className="btn-cyber btn-success w-full justify-center mt-4"
            id="report-generate-btn"
          >
            {generating ? <><LoadingSpinner size={16} label={null}/> Generating PDF...</> : <><FiDownload size={14}/> Generate & Download PDF</>}
          </button>
        </GlassCard>
      )}

      {scans.length === 0 && (
        <div className="text-center py-16 glass rounded-xl border border-cyber-border">
          <p className="text-4xl mb-3">📄</p>
          <p className="text-cyber-muted text-sm">Fill the form above and add scan entries to generate your report</p>
        </div>
      )}
    </div>
  )
}
