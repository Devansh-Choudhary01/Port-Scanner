import { FiShield, FiSearch, FiAlertTriangle, FiZap, FiActivity, FiClock, FiGlobe, FiDatabase, FiCpu } from 'react-icons/fi'
import StatCard from '../components/ui/StatCard'
import GlassCard from '../components/ui/GlassCard'
import ActivityLog from '../components/ActivityLog'
import { ThreatLineChart, VulnDonutChart, ActivityBarChart } from '../components/charts/Charts'

export default function Dashboard() {
  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">
            Threat <span className="gradient-text">Intelligence</span>
          </h1>
          <p className="text-xs text-cyber-muted mt-1 font-mono">
            Last updated: {new Date().toLocaleTimeString()} · All systems operational
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 glass rounded-xl border border-cyber-green/20">
          <span className="status-dot dot-online animate-pulse-slow" />
          <span className="text-xs font-bold text-cyber-green">LIVE</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard label="Total Scans"     value={1247}  icon={FiActivity}      color="cyan"   trend={12}  delay={0}    />
        <StatCard label="Threats Found"   value={84}    icon={FiAlertTriangle} color="red"    trend={-5}  delay={0.05} />
        <StatCard label="Open Ports"      value={312}   icon={FiSearch}        color="purple" trend={3}   delay={0.1}  />
        <StatCard label="Vulns Detected"  value={56}    icon={FiShield}        color="orange" trend={8}   delay={0.15} />
        <StatCard label="Exploits Run"    value={23}    icon={FiZap}           color="green"  trend={0}   delay={0.2}  />
        <StatCard label="Uptime"          value="99.9"  icon={FiClock}         color="cyan"   suffix="%"  delay={0.25} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <GlassCard title="Threat Activity — 24h" className="xl:col-span-2" delay={0.1}>
          <div style={{ height: 220 }}>
            <ThreatLineChart />
          </div>
        </GlassCard>
        <GlassCard title="Vulnerability Breakdown" delay={0.15}>
          <div style={{ height: 220 }}>
            <VulnDonutChart />
          </div>
        </GlassCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <GlassCard title="Weekly Activity" delay={0.2}>
          <div style={{ height: 200 }}>
            <ActivityBarChart />
          </div>
        </GlassCard>
        <div style={{ minHeight: 280 }}>
          <ActivityLog />
        </div>
      </div>

      {/* Quick Launch */}
      <GlassCard title="Quick Launch" delay={0.25}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Port Scanner',     path: '/recon/port-scanner',  color: 'cyan',   icon: <FiSearch size={22} /> },
            { label: 'Website Scanner',  path: '/vulnscan/website',     color: 'purple', icon: <FiGlobe size={22} /> },
            { label: 'SQL Injection',    path: '/exploits/sqli',        color: 'red',    icon: <FiDatabase size={22} /> },
            { label: 'AI Assistant',     path: '/ai',                   color: 'green',  icon: <FiCpu size={22} /> },
          ].map(({ label, path, color, icon }) => (
            <a
              key={path}
              href={path}
              className={`btn-cyber justify-center text-sm py-3 flex-col gap-2 h-auto`}
              style={{
                borderColor: color === 'red' ? 'rgba(255,45,85,0.4)' :
                             color === 'purple' ? 'rgba(139,92,246,0.4)' :
                             color === 'green' ? 'rgba(0,255,136,0.4)' :
                             'rgba(0,212,255,0.4)',
                color: color === 'red' ? '#FF2D55' :
                       color === 'purple' ? '#8B5CF6' :
                       color === 'green' ? '#00FF88' : '#00D4FF',
              }}
            >
              <span className="flex items-center justify-center mb-1">{icon}</span>
              {label}
            </a>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
