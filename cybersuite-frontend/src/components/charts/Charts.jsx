import { Line, Doughnut, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, BarElement, Title, Tooltip, Legend, Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, BarElement, Title, Tooltip, Legend, Filler
)

const COMMON_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#64748B', font: { size: 11, family: 'Inter' } } },
    tooltip: {
      backgroundColor: '#141B2D',
      borderColor: '#1E2D4A',
      borderWidth: 1,
      titleColor: '#E2E8F0',
      bodyColor: '#94A3B8',
    },
  },
  scales: {
    x: {
      ticks: { color: '#64748B', font: { size: 10 } },
      grid:  { color: 'rgba(30,45,74,0.4)' },
    },
    y: {
      ticks: { color: '#64748B', font: { size: 10 } },
      grid:  { color: 'rgba(30,45,74,0.4)' },
    },
  },
}

const labels24h = ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22']
const rnd = (n, max) => Array.from({ length: n }, () => Math.floor(Math.random() * max))

export function ThreatLineChart() {
  const data = {
    labels: labels24h,
    datasets: [
      {
        label: 'Threats Detected',
        data: rnd(12, 80),
        borderColor: '#00D4FF',
        backgroundColor: 'rgba(0,212,255,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#00D4FF',
        pointBorderColor: '#0A0E1A',
        borderWidth: 2,
      },
      {
        label: 'Scans Run',
        data: rnd(12, 50),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139,92,246,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#8B5CF6',
        pointBorderColor: '#0A0E1A',
        borderWidth: 2,
      },
    ],
  }
  return <Line data={data} options={COMMON_OPTS} />
}

export function VulnDonutChart() {
  const data = {
    labels: ['Critical', 'High', 'Medium', 'Low', 'None'],
    datasets: [{
      data: [4, 11, 23, 35, 12],
      backgroundColor: ['#FF2D55', '#FF6B35', '#FFD600', '#00FF88', '#334155'],
      borderColor: '#0A0E1A',
      borderWidth: 3,
      hoverOffset: 6,
    }],
  }
  const opts = {
    ...COMMON_OPTS,
    scales: {},
    plugins: {
      ...COMMON_OPTS.plugins,
      legend: { position: 'right', labels: { color: '#94A3B8', font: { size: 11 }, padding: 12 } },
    },
    cutout: '68%',
  }
  return <Doughnut data={data} options={opts} />
}

export function ActivityBarChart() {
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Recon',
        data: rnd(7, 30),
        backgroundColor: 'rgba(0,212,255,0.7)',
        borderRadius: 4,
      },
      {
        label: 'VulnScan',
        data: rnd(7, 25),
        backgroundColor: 'rgba(139,92,246,0.7)',
        borderRadius: 4,
      },
      {
        label: 'Exploits',
        data: rnd(7, 12),
        backgroundColor: 'rgba(255,45,85,0.7)',
        borderRadius: 4,
      },
    ],
  }
  return <Bar data={data} options={{ ...COMMON_OPTS, plugins: { ...COMMON_OPTS.plugins } }} />
}
