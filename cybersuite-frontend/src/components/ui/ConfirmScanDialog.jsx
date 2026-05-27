/**
 * F13 — ConfirmScanDialog
 * Reusable modal to confirm before running a scan.
 */
import { motion, AnimatePresence } from 'framer-motion'
import { FiAlertTriangle, FiX, FiZap } from 'react-icons/fi'

export default function ConfirmScanDialog({ open, onConfirm, onCancel, toolName, target }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(5,8,16,0.8)', backdropFilter: 'blur(8px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="glass w-full max-w-md p-6 relative"
            style={{ border: '1px solid rgba(255,165,0,0.3)', boxShadow: '0 0 32px rgba(255,165,0,0.15)' }}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <FiX size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(255,165,0,0.15)', border: '1px solid rgba(255,165,0,0.3)' }}>
                <FiAlertTriangle size={20} style={{ color: '#FFA500' }} />
              </div>
              <div>
                <h3 className="font-bold text-white">Confirm Scan</h3>
                <p className="text-xs" style={{ color: '#64748B' }}>Security operation — confirm target authorization</p>
              </div>
            </div>

            <div className="mb-5 p-3 rounded-lg" style={{ background: 'rgba(255,165,0,0.05)', border: '1px solid rgba(255,165,0,0.15)' }}>
              <p className="text-sm" style={{ color: '#94A3B8' }}>
                You are about to run <span className="font-semibold text-white">{toolName}</span>
                {target && <> on <span className="font-mono" style={{ color: '#00D4FF' }}>{target}</span></>}.
              </p>
              <p className="text-xs mt-2" style={{ color: '#64748B' }}>
                By continuing, you confirm that you own or have explicit written authorization to test this target.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={onCancel} className="btn-cyber flex-1 justify-center btn-danger text-sm">
                Cancel
              </button>
              <button onClick={onConfirm} className="btn-cyber flex-1 justify-center text-sm" style={{ borderColor: 'rgba(0,255,136,0.4)', color: '#00FF88' }}>
                <FiZap size={14} className="mr-1.5" />
                Run Scan
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
