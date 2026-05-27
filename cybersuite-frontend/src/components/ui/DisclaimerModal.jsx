/**
 * F3 — Legal Disclaimer Modal (first-visit only)
 * Stored in localStorage so it shows only once per browser.
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiAlertTriangle, FiCheck } from 'react-icons/fi'

export default function DisclaimerModal() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('cybersuite-disclaimer')
    if (!accepted) setVisible(true)
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cybersuite-disclaimer', '1')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(5,8,16,0.92)', backdropFilter: 'blur(12px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="glass w-full max-w-lg p-8"
            style={{ border: '1px solid rgba(255,45,85,0.3)', boxShadow: '0 0 48px rgba(255,45,85,0.1)' }}
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
          >
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(255,45,85,0.12)', border: '1px solid rgba(255,45,85,0.25)' }}>
                <FiAlertTriangle size={24} style={{ color: '#FF2D55' }} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">Legal Disclaimer</h2>
                <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>Please read before using CyberSuite</p>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-3 mb-6 text-sm" style={{ color: '#94A3B8', lineHeight: 1.7 }}>
              <p>
                CyberSuite is a <strong className="text-white">professional security research platform</strong> designed exclusively for authorized testing of systems you own or have explicit written permission to test.
              </p>
              <p>
                <strong style={{ color: '#FF2D55' }}>Unauthorized use of these tools is illegal</strong> and may violate the Computer Fraud and Abuse Act (CFAA), the UK Computer Misuse Act, and equivalent laws worldwide.
              </p>
              <p>
                By clicking "I Agree", you confirm that you are at least 18 years old, are a security professional or researcher, and will only test systems you are authorized to access.
              </p>
            </div>

            {/* CTA */}
            <button
              id="disclaimer-accept-btn"
              onClick={handleAccept}
              className="btn-cyber w-full justify-center py-3 text-sm font-bold"
              style={{ borderColor: 'rgba(0,212,255,0.5)', color: '#00D4FF' }}
            >
              <FiCheck size={16} />
              I Agree — I Am Authorized to Use These Tools
            </button>

            <p className="text-center text-xs mt-4" style={{ color: '#475569' }}>
              This notice is displayed once per browser session.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
