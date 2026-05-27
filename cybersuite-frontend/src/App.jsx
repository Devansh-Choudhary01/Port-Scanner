import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/layout/Navbar'
import Dashboard       from './pages/Dashboard'
import ReconTools      from './pages/ReconTools'
import VulnScanners    from './pages/VulnScanners'
import Exploits        from './pages/Exploits'
import AttackMap       from './pages/AttackMap'
import ScanHistory     from './pages/ScanHistory'
import AIAssistantPage from './pages/AIAssistantPage'
import ReportGenerator from './pages/ReportGenerator'
import Login           from './pages/Login'
import ProtectedRoute  from './components/auth/ProtectedRoute'
import DisclaimerModal from './components/ui/DisclaimerModal'

import bgVideo from './components/ui/video/322144.mp4'

// Wrap routes that need auth
const P = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>

export default function App() {
  return (
    <div className="min-h-screen flex flex-col relative z-0">
      
      {/* F3 — Legal disclaimer shown on first visit */}
      <DisclaimerModal />

      {/* F5 — Background video capped at 6% opacity */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-[-50] pointer-events-none"
        style={{ opacity: 0.06 }}
        src={bgVideo}
      />
      
      {/* Clarity overlay */}
      <div className="fixed inset-0 z-[-40] bg-[#0A0E1A]/50 bg-gradient-to-t from-[#0A0E1A]/90 via-transparent to-[#0A0E1A]/60 pointer-events-none" />

      <Routes>
        {/* Public — Login */}
        <Route path="/login" element={<Login />} />

        {/* Protected — everything else renders with Navbar */}
        <Route path="*" element={
          <P>
            <>
              <Navbar />
              <main className="flex-1 relative z-10">
                <Routes>
                  <Route path="/"                    element={<Dashboard />} />
                  {/* Recon */}
                  <Route path="/recon/port-scanner"  element={<ReconTools />} />
                  <Route path="/recon/subdomain"     element={<ReconTools />} />
                  <Route path="/recon/whois"         element={<ReconTools />} />
                  <Route path="/recon/dns"           element={<ReconTools />} />
                  <Route path="/recon/network"       element={<ReconTools />} />
                  {/* VulnScan */}
                  <Route path="/vulnscan/password"   element={<VulnScanners />} />
                  <Route path="/vulnscan/website"    element={<VulnScanners />} />
                  <Route path="/vulnscan/wordpress"  element={<VulnScanners />} />
                  {/* Exploits */}
                  <Route path="/exploits/sqli"       element={<Exploits />} />
                  <Route path="/exploits/xss"        element={<Exploits />} />
                  {/* Other pages */}
                  <Route path="/attack-map"          element={<AttackMap />} />
                  <Route path="/history"             element={<ScanHistory />} />
                  <Route path="/ai"                  element={<AIAssistantPage />} />
                  <Route path="/reports"             element={<ReportGenerator />} />
                  {/* Fallback */}
                  <Route path="*"                    element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </>
          </P>
        } />
      </Routes>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#141B2D',
            color: '#E2E8F0',
            border: '1px solid #1E2D4A',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#00FF88', secondary: '#141B2D' } },
          error:   { iconTheme: { primary: '#FF2D55', secondary: '#141B2D' } },
        }}
      />
    </div>
  )
}
