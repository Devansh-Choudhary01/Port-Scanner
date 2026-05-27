/**
 * F2 — ConsentCheckbox
 * Reusable checkbox confirming users are authorized to test target.
 */
export default function ConsentCheckbox({ checked, onChange }) {
  return (
    <label
      className="flex items-start gap-3 cursor-pointer select-none"
      style={{ userSelect: 'none' }}
    >
      <div className="relative mt-0.5 flex-shrink-0">
        <input
          id="consent-checkbox"
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className="w-4 h-4 rounded flex items-center justify-center transition-all"
          style={{
            background: checked ? 'rgba(0,212,255,0.2)' : 'transparent',
            border: `1.5px solid ${checked ? '#00D4FF' : 'rgba(30,45,74,0.8)'}`,
            boxShadow: checked ? '0 0 8px rgba(0,212,255,0.3)' : 'none',
          }}
        >
          {checked && (
            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
              <path d="M1 3L3.5 5.5L8 1" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
      <span className="text-xs leading-relaxed" style={{ color: '#64748B' }}>
        I confirm I am <strong className="text-white">authorized</strong> to test this target and take full legal responsibility for this scan.
      </span>
    </label>
  )
}
