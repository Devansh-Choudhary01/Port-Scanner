/**
 * F11 — RateLimitBadge
 * Shows current rate limit policy as an inline badge.
 */
export default function RateLimitBadge({ limit = 30 }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{
        background: 'rgba(0,212,255,0.08)',
        border: '1px solid rgba(0,212,255,0.2)',
        color: '#64748B',
      }}
      title={`Rate limit: ${limit} requests per minute per IP`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: '#00D4FF', boxShadow: '0 0 4px #00D4FF' }}
      />
      {limit} req / min
    </span>
  )
}
