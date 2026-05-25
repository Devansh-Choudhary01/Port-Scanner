import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiShield, FiSearch, FiAlertTriangle, FiZap,
  FiGlobe, FiClock, FiMessageSquare, FiFileText,
  FiChevronDown, FiMenu, FiX
} from 'react-icons/fi'

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: FiShield },
  {
    label: 'Recon',
    icon: FiSearch,
    children: [
      { label: 'Port Scanner',      path: '/recon/port-scanner' },
      { label: 'Subdomain Finder',  path: '/recon/subdomain' },
      { label: 'WHOIS Lookup',      path: '/recon/whois' },
      { label: 'DNS Lookup',        path: '/recon/dns' },
      { label: 'Network Scanner',   path: '/recon/network' },
    ],
  },
  {
    label: 'Vuln Scan',
    icon: FiAlertTriangle,
    children: [
      { label: 'Password Checker',  path: '/vulnscan/password' },
      { label: 'Website Scanner',   path: '/vulnscan/website' },
      { label: 'WordPress Scanner', path: '/vulnscan/wordpress' },
    ],
  },
  {
    label: 'Exploits',
    icon: FiZap,
    children: [
      { label: 'SQL Injection Test', path: '/exploits/sqli' },
      { label: 'XSS Tester',        path: '/exploits/xss' },
    ],
  },
  { label: 'Attack Map', path: '/attack-map',  icon: FiGlobe },
  { label: 'History',    path: '/history',     icon: FiClock },
  { label: 'AI',         path: '/ai',          icon: FiMessageSquare },
  { label: 'Reports',    path: '/reports',     icon: FiFileText },
]

const DropMenu = ({ items, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -8, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -8, scale: 0.96 }}
    transition={{ duration: 0.18 }}
    className="absolute top-full left-0 mt-2 w-52 glass border border-cyber-border rounded-xl overflow-hidden z-50 shadow-glass"
  >
    {items.map((item) => (
      <Link
        key={item.path}
        to={item.path}
        onClick={onClose}
        className="flex items-center gap-2 px-4 py-3 text-sm text-cyber-muted hover:text-cyber-cyan hover:bg-white/5 transition-colors border-b border-cyber-border/30 last:border-0"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan/40 flex-shrink-0" />
        {item.label}
      </Link>
    ))}
  </motion.div>
)

export default function Navbar() {
  const location = useLocation()
  const [openDrop, setOpenDrop] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])

  // Flatten items for search
  const allServices = NAV_ITEMS.reduce((acc, item) => {
    if (item.children) {
      return [...acc, ...item.children.map(c => ({ ...c, category: item.label, icon: item.icon }))]
    }
    return [...acc, { ...item, category: 'Root' }]
  }, [])

  const handleSearch = (q) => {
    setSearchQuery(q)
    if (!q.trim()) { setSearchResults([]); return }
    const filtered = allServices.filter(s => 
      s.label.toLowerCase().includes(q.toLowerCase()) || 
      s.category.toLowerCase().includes(q.toLowerCase())
    )
    setSearchResults(filtered)
  }

  const toggle = (label) => setOpenDrop(prev => prev === label ? null : label)

  return (
    <nav className="sticky top-0 z-50 glass border-b border-cyber-border/50">
      <div className="w-full px-4 h-14 flex items-center gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyber-cyan to-cyber-blue flex items-center justify-center shadow-neon-cyan">
            <FiShield className="text-white" size={16} />
          </div>
          <span className="font-black text-lg tracking-tight">
            <span className="gradient-text">Cyber</span>
            <span className="text-white">Suite</span>
          </span>
        </Link>

        {/* Right-side group: nav, status, mobile toggle */}
        <div className="flex items-center gap-3 ml-auto">

          {/* Desktop Nav (logo left, items right) */}
          <div className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = item.path
              ? location.pathname === item.path
              : item.children?.some(c => location.pathname === c.path)

            if (item.children) {
              return (
                <div 
                  key={item.label} 
                  className="relative"
                  onMouseEnter={() => setOpenDrop(item.label)}
                  onMouseLeave={() => setOpenDrop(null)}
                >
                  <button
                    onClick={() => toggle(item.label)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'text-cyber-cyan bg-cyan-500/10'
                        : 'text-cyber-muted hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={14} />
                    {item.label}
                    <FiChevronDown
                      size={12}
                      className={`transition-transform ${openDrop === item.label ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <AnimatePresence>
                    {openDrop === item.label && (
                      <DropMenu items={item.children} onClose={() => setOpenDrop(null)} />
                    )}
                  </AnimatePresence>
                </div>
              )
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-cyber-cyan bg-cyan-500/10'
                    : 'text-cyber-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={14} />
                {item.label}
              </Link>
            )
          })}
          </div>

          {/* Service Search */}
          <div className="relative group ml-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 glass rounded-xl border transition-all duration-300 ${isSearching ? 'border-cyber-cyan shadow-neon-cyan/20 w-64' : 'border-cyber-border/50 w-48'}`}>
              <FiSearch className={isSearching ? 'text-cyber-cyan' : 'text-cyber-muted'} size={14} />
              <input
                type="text"
                placeholder="Search services..."
                className="bg-transparent border-none outline-none text-xs text-white placeholder:text-cyber-muted/50 w-full font-mono"
                value={searchQuery}
                onFocus={() => setIsSearching(true)}
                onBlur={() => setTimeout(() => setIsSearching(false), 200)}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {isSearching && searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-72 glass border border-cyber-border rounded-xl overflow-hidden z-50 shadow-2xl"
                >
                  <div className="p-2 max-h-[400px] overflow-y-auto">
                    {searchResults.length > 0 ? (
                      searchResults.map((s) => (
                        <Link
                          key={s.path}
                          to={s.path}
                          onClick={() => { setSearchQuery(''); setIsSearching(false) }}
                          className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors group/item"
                        >
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-cyber-muted group-hover/item:text-cyber-cyan group-hover/item:bg-cyber-cyan/10 transition-colors">
                            {s.icon ? <s.icon size={16} /> : <FiSearch size={16} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white group-hover/item:text-cyber-cyan transition-colors truncate">
                              {s.label}
                            </p>
                            <p className="text-[10px] text-cyber-muted uppercase tracking-tighter">
                              {s.category}
                            </p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-xs text-cyber-muted">No services found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden p-2 text-cyber-muted hover:text-white"
            onClick={() => setMobileOpen(p => !p)}
            id="mobile-menu-toggle"
          >
            {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-t border-cyber-border/50 overflow-hidden"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                if (item.children) {
                  return (
                    <div key={item.label}>
                      <p className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-cyber-muted">
                        {item.label}
                      </p>
                      {item.children.map(c => (
                        <Link
                          key={c.path}
                          to={c.path}
                          onClick={() => setMobileOpen(false)}
                          className="block px-5 py-2 text-sm text-cyber-muted hover:text-cyber-cyan"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )
                }
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-cyber-muted hover:text-cyber-cyan hover:bg-white/5"
                  >
                    <item.icon size={14} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
