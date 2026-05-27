import { useState } from 'react'
import { motion } from 'framer-motion'
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

import { FiSearch, FiGlobe, FiClipboard, FiLink, FiRadio } from 'react-icons/fi'

const TOOLS = [
  { id: 'port',      label: 'Port Scanner',     desc: 'Scan TCP ports on a target host',      icon: <FiSearch size={24} />, path: '/api/recon/port-scan'      },
  { id: 'subdomain', label: 'Subdomain Finder',  desc: 'Enumerate subdomains via DNS',          icon: <FiGlobe size={24} />, path: '/api/recon/subdomain-finder' },
  { id: 'whois',     label: 'WHOIS Lookup',      desc: 'Domain registration information',       icon: <FiClipboard size={24} />, path: '/api/recon/whois'            },
  { id: 'dns',       label: 'DNS Lookup',        desc: 'Query all DNS record types',            icon: <FiLink size={24} />, path: '/api/recon/dns'              },
  { id: 'network',   label: 'Network Scanner',   desc: 'Host liveness + OS fingerprinting',    icon: <FiRadio size={24} />, path: '/api/recon/network-scan'     },
]

function ToolCard({ tool, selected, onClick }) {
  return (
    <button
      onClick={() => onClick(tool.id)}
      className={`glass glass-hover p-4 text-left border transition-all rounded-xl w-full ${
        selected ? 'border-cyber-cyan/50 bg-cyan-500/5' : 'border-cyber-border'
      }`}
    >
      <span className="text-2xl">{tool.icon}</span>
      <p className="text-sm font-bold mt-2 text-cyber-text">{tool.label}</p>
      <p className="text-xs text-cyber-muted mt-0.5">{tool.desc}</p>
    </button>
  )
}

const PRESETS = [
  { label: 'Basic',   ports: [21, 22, 23, 25, 53, 80, 443, 8080] },
  { label: 'Common',  ports: [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 3306, 3389, 5432, 5900, 6379, 8080] },
  { label: 'Web',     ports: [80, 443, 8000, 8080, 8081, 8443, 9000] },
  { label: 'Games',   ports: [25565, 27015, 3074, 3478, 1119, 28015] },
  { label: 'Threats', ports: [135, 137, 138, 139, 445, 1433, 2323, 5060, 11211, 32764] },
]

export default function ReconTools() {
  const [active, setActive]     = useState('port')
  const [host, setHost]         = useState('')
  const [startPort, setStart]   = useState(1)
  const [endPort, setEnd]       = useState(1024)
  const [protocol, setProtocol] = useState('TCP')
  const [customPorts, setCustom] = useState('')
  const [dnsType, setDnsType]   = useState('ALL')
  const [isScanning, setScan]   = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult]     = useState(null)
  const [termLines, setTerm]    = useState([])
  const [consent, setConsent]   = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const tool = TOOLS.find(t => t.id === active)

  const applyPreset = (ports) => {
    setCustom(ports.join(', '))
    setStart(null)
    setEnd(null)
  }

  const addTermLine = (text, type = 'info') =>
    setTerm(prev => [...prev, { text, type }])

  const handleRun = () => {
    if (!host.trim()) { toast.error('Please enter a target host or domain'); return }
    if (!consent) { toast.error('Please confirm authorization first'); return }
    setShowConfirm(true)
  }

  const runScan = async () => {
    setShowConfirm(false)
    setScan(true); setResult(null); setTerm([]); setProgress(0)

    const progressTick = setInterval(() => setProgress(p => Math.min(p + 2, 92)), 80)

    try {
      addTermLine(`> Starting ${tool.label}...`, 'prompt')
      addTermLine(`> Target: ${host}`, 'info')

      let payload = { consent_confirmed: true }
      let type = 'generic'
      let endpoint = tool.path

      if (active === 'port') {
        const portsArr = customPorts ? customPorts.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p)) : null
        payload = { 
          ...payload,
          host, 
          protocol,
          ports: portsArr,
          start_port: portsArr ? null : +startPort, 
          end_port: portsArr ? null : +endPort 
        }
        type = 'port'
        addTermLine(`> Mode: ${protocol}`, 'info')
        if (portsArr) addTermLine(`> Ports: ${portsArr.length} specific targets`, 'info')
        else addTermLine(`> Range: ${startPort}-${endPort}`, 'info')
      } else if (active === 'subdomain') {
        payload = { ...payload, domain: host }
        type = 'subdomain'
      } else if (active === 'whois') {
        payload = { ...payload, domain: host }
      } else if (active === 'dns') {
        payload = { ...payload, domain: host, record_type: dnsType }
      } else if (active === 'network') {
        payload = { ...payload, host }
      }

      const res = await api.post(endpoint, payload)
      clearInterval(progressTick); setProgress(100)

      addTermLine('> Scan complete ✓', 'success')
      setResult({ data: res.data, type })
      toast.success(`${tool.label} completed successfully`)
    } catch (err) {
      clearInterval(progressTick); setProgress(0)
      const msg = err.response?.data?.detail || 'Scan failed'
      addTermLine(`> ERROR: ${msg}`, 'error')
      toast.error(msg)
    } finally {
      setScan(false)
    }
  }

  return (
    <div className="page-container space-y-5">
      <div>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-black text-white">Recon <span className="gradient-text">Tools</span></h1>
            <p className="text-xs text-cyber-muted mt-1 font-mono">Reconnaissance & information gathering modules</p>
          </div>
          <RateLimitBadge />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {TOOLS.map(t => <ToolCard key={t.id} tool={t} selected={active === t.id} onClick={setActive} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Panel */}
        <GlassCard title={`Configure — ${tool.label}`}>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-cyber-muted uppercase tracking-widest mb-1.5 block">
                {active === 'subdomain' || active === 'whois' || active === 'dns' ? 'Domain' : 'Host / IP'}
              </label>
              <input
                className="cyber-input"
                placeholder="e.g. scanme.nmap.org"
                value={host}
                onChange={e => setHost(e.target.value)}
                id="recon-host-input"
                onKeyDown={e => e.key === 'Enter' && runScan()}
              />
            </div>

            {active === 'port' && (
              <div className="space-y-4">
                {/* Protocol Selector */}
                <div className="flex gap-2">
                  {['TCP', 'UDP'].map(p => (
                    <button
                      key={p}
                      onClick={() => setProtocol(p)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        protocol === p 
                          ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan' 
                          : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Presets */}
                <div className="grid grid-cols-5 gap-2">
                  {PRESETS.map(p => (
                    <button
                      key={p.label}
                      onClick={() => applyPreset(p.ports)}
                      className="py-2 glass glass-hover text-[10px] font-bold text-cyber-muted hover:text-white rounded-lg border border-white/5"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-cyber-muted uppercase tracking-widest mb-1.5 block">Start Port</label>
                    <input 
                      className="cyber-input" 
                      type="number" 
                      min={1} 
                      max={65535} 
                      value={startPort || ''} 
                      onChange={e => { setStart(e.target.value); setCustom('') }} 
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-cyber-muted uppercase tracking-widest mb-1.5 block">End Port</label>
                    <input 
                      className="cyber-input" 
                      type="number" 
                      min={1} 
                      max={65535} 
                      value={endPort || ''} 
                      onChange={e => { setEnd(e.target.value); setCustom('') }} 
                      placeholder="1024"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-cyber-muted uppercase tracking-widest mb-1.5 block">Custom Ports (e.g. 80, 443, 8080)</label>
                  <input 
                    className="cyber-input" 
                    placeholder="80, 443, ..."
                    value={customPorts}
                    onChange={e => setCustom(e.target.value)}
                  />
                </div>
              </div>
            )}

            {active === 'dns' && (
              <div>
                <label className="text-xs text-cyber-muted uppercase tracking-widest mb-1.5 block">Record Type</label>
                <select className="cyber-input" value={dnsType} onChange={e => setDnsType(e.target.value)}>
                  {['ALL','A','AAAA','MX','NS','TXT','CNAME','SOA'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            )}

            {/* Consent Checkbox */}
            <ConsentCheckbox checked={consent} onChange={setConsent} />

            <button onClick={handleRun} disabled={isScanning || !consent} className="btn-cyber w-full justify-center" id="recon-scan-btn">
              {isScanning ? <><LoadingSpinner size={16} label={null} /> Scanning...</> : `▶ Run ${tool.label}`}
            </button>

            {isScanning && <ScanProgressBar progress={progress} label={`${tool.label} in progress...`} />}
          </div>
        </GlassCard>

        {/* Terminal */}
        <GlassCard title="Scan Terminal">
          <ScanTerminal isScanning={isScanning} target={host} scanLines={termLines} />
        </GlassCard>
      </div>

      {/* Results */}
      {result && (
        <GlassCard title="Scan Results">
          <ScanResults data={result.data} type={result.type} />
        </GlassCard>
      )}

      {/* F13 — Confirm dialog */}
      <ConfirmScanDialog
        open={showConfirm}
        onConfirm={runScan}
        onCancel={() => setShowConfirm(false)}
        toolName={tool.label}
        target={host}
      />
    </div>
  )
}
