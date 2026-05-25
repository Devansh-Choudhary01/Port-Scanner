import { useState } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '../components/ui/GlassCard'
import NeonBadge from '../components/ui/NeonBadge'
import { FiTrash2, FiSearch } from 'react-icons/fi'

const MOCK_HISTORY = [
  { id:1, tool:'Port Scanner',     target:'scanme.nmap.org', time:'2026-04-18 22:10', risk:'low',     open:3  },
  { id:2, tool:'Website Scanner',  target:'example.com',     time:'2026-04-18 21:55', risk:'medium',  open:7  },
  { id:3, tool:'SQL Injection',    target:'testphp.com',     time:'2026-04-18 21:40', risk:'high',    open:2  },
  { id:4, tool:'Subdomain Finder', target:'github.com',      time:'2026-04-18 21:20', risk:'none',    open:14 },
  { id:5, tool:'WordPress Scanner',target:'wp-test.com',     time:'2026-04-18 21:00', risk:'critical',open:5  },
  { id:6, tool:'WHOIS Lookup',     target:'google.com',      time:'2026-04-18 20:45', risk:'none',    open:0  },
  { id:7, tool:'XSS Tester',       target:'demo-app.com',    time:'2026-04-18 20:30', risk:'medium',  open:3  },
  { id:8, tool:'DNS Lookup',       target:'cloudflare.com',  time:'2026-04-18 20:15', risk:'none',    open:0  },
]

export default function ScanHistory() {
  const [records, setRecords] = useState(MOCK_HISTORY)
  const [filter, setFilter]   = useState('')
  const [riskFilter, setRisk] = useState('all')

  const filtered = records.filter(r => {
    const matchText = r.tool.toLowerCase().includes(filter.toLowerCase()) ||
                      r.target.toLowerCase().includes(filter.toLowerCase())
    const matchRisk = riskFilter === 'all' || r.risk === riskFilter
    return matchText && matchRisk
  })

  return (
    <div className="page-container space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">Scan <span className="gradient-text">History</span></h1>
        <p className="text-xs text-cyber-muted mt-1 font-mono">{records.length} recorded scans in this session</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 relative min-w-52">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted" size={14} />
          <input
            className="cyber-input pl-9"
            placeholder="Search tool or target..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            id="history-search"
          />
        </div>
        <select className="cyber-input w-auto" value={riskFilter} onChange={e => setRisk(e.target.value)} id="history-risk-filter">
          <option value="all">All Risk Levels</option>
          {['none','low','medium','high','critical'].map(r => (
            <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>
          ))}
        </select>
        <button onClick={() => setRecords([])} className="btn-cyber btn-danger px-4" id="history-clear-btn">
          <FiTrash2 size={14}/> Clear All
        </button>
      </div>

      {/* Table */}
      <GlassCard>
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="cyber-table min-w-[600px] w-full text-left">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tool</th>
                  <th>Target</th>
                  <th>Time</th>
                  <th>Risk</th>
                  <th>Findings</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <td className="text-cyber-muted font-mono text-xs p-3 border-b border-cyber-border/30">{r.id}</td>
                    <td className="font-semibold text-cyber-text p-3 border-b border-cyber-border/30">{r.tool}</td>
                    <td className="font-mono text-cyber-cyan text-xs p-3 border-b border-cyber-border/30">{r.target}</td>
                    <td className="text-cyber-muted text-xs font-mono p-3 border-b border-cyber-border/30">{r.time}</td>
                    <td className="p-3 border-b border-cyber-border/30"><NeonBadge level={r.risk}>{r.risk}</NeonBadge></td>
                    <td className="font-mono text-cyber-muted p-3 border-b border-cyber-border/30">{r.open}</td>
                    <td className="p-3 border-b border-cyber-border/30 text-right">
                      <button
                        onClick={() => setRecords(prev => prev.filter(x => x.id !== r.id))}
                        className="text-cyber-muted hover:text-cyber-red transition-colors"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-cyber-muted">No scan records found</p>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
