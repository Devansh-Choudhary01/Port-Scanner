/**
 * F12 — Reusable ToolTip component
 * Usage: <ToolTip text="What this does"><button>?</button></ToolTip>
 */
import { useState } from 'react'

export default function ToolTip({ text, children, position = 'top' }) {
  const [visible, setVisible] = useState(false)

  const posClass = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[position] || 'bottom-full left-1/2 -translate-x-1/2 mb-2'

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          className={`absolute ${posClass} z-50 w-max max-w-xs px-3 py-2 rounded-lg text-xs font-medium text-white pointer-events-none`}
          style={{
            background: 'rgba(10,14,26,0.95)',
            border: '1px solid rgba(0,212,255,0.25)',
            boxShadow: '0 0 12px rgba(0,212,255,0.15)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {text}
        </span>
      )}
    </span>
  )
}
