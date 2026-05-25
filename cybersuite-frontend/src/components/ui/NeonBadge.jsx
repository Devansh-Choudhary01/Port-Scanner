export default function NeonBadge({ level = 'none', children }) {
  const map = {
    critical: 'badge-critical',
    high:     'badge-high',
    medium:   'badge-medium',
    low:      'badge-low',
    none:     'badge-none',
    open:     'badge-low',
    closed:   'badge-none',
    alive:    'badge-low',
    dead:     'badge-none',
  }
  const cls = map[level?.toLowerCase()] || 'badge-none'
  return <span className={`badge ${cls}`}>{children || level}</span>
}
