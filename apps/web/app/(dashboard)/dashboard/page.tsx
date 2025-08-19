"use client"
import { useEffect, useState } from "react"
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DashboardStats {
  eventsToday: number
  highRiskToday: number
  totalVisitors: number
  uniqueVisitors: number
  topCountries: { country: string; count: number }[]
  riskBreakdown: { low: number; medium: number; high: number }
  recentActivity: any[]
  eventsOverTime: Record<string, number>
}


export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchStats = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/dashboard/stats")
      if (!res.ok) throw new Error("Failed to fetch stats")
      const data = await res.json()
      setStats(data)
    } catch (err: any) {
      setError(err.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-6 tracking-tight">Dashboard</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard label="Events Today" value={stats.eventsToday} />
            <StatCard label="High Risk Today" value={stats.highRiskToday} highlight />
            <StatCard label="Total Visitors" value={stats.totalVisitors} />
            <StatCard label="Unique Visitors" value={stats.uniqueVisitors} />
            <div className="bg-white rounded shadow p-4">
              <div className="font-medium mb-2">Top Countries</div>
              <ul>
                {stats.topCountries.length === 0 && <li className="text-gray-400">No data</li>}
                {stats.topCountries.map(tc => (
                  <li key={tc.country} className="flex items-center justify-between">
                    <span>{tc.country}</span>
                    <span className="font-mono">{tc.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded shadow p-6">
              <div className="font-semibold text-lg mb-4">Risk Breakdown</div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold mb-1">Low</span><span className="text-2xl font-bold">{stats.riskBreakdown?.low ?? 0}</span></div>
                <div className="flex flex-col items-center"><span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-bold mb-1">Medium</span><span className="text-2xl font-bold">{stats.riskBreakdown?.medium ?? 0}</span></div>
                <div className="flex flex-col items-center"><span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold mb-1">High</span><span className="text-2xl font-bold">{stats.riskBreakdown?.high ?? 0}</span></div>
              </div>
            </div>
            <div className="bg-white rounded shadow p-6">
              <div className="font-semibold text-lg mb-4">Recent Activity</div>
              {stats.recentActivity.length === 0 ? (
                <div className="h-24 flex items-center justify-center text-gray-300">No recent events</div>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="text-left">Time</th>
                      <th className="text-left">Visitor</th>
                      <th className="text-left">Risk</th>
                      <th className="text-left">Country</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentActivity.map((ev, i) => (
                      <tr key={ev.id || i}>
                        <td>{new Date(ev.timestamp).toLocaleTimeString()}</td>
                        <td>{ev.visitor_id?.slice(0, 6) || '-'}</td>
                        <td>{ev.properties?.verdict || '-'}</td>
                        <td>{ev.properties?.ip_country || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          <div className="bg-white rounded shadow p-6 mt-8">
            <div className="font-semibold text-lg mb-4">Events Over Time</div>
            {Object.keys(stats.eventsOverTime || {}).length === 0 ? (
              <div className="h-32 flex items-center justify-center text-gray-400">No data</div>
            ) : (
              <Bar
                data={{
                  labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
                  datasets: [
                    {
                      label: 'Events',
                      data: Array.from({ length: 24 }, (_, i) => stats.eventsOverTime[i] || 0),
                      backgroundColor: 'rgba(59,130,246,0.7)',
                      borderRadius: 6,
                      maxBarThickness: 24,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: false },
                    tooltip: { enabled: true },
                  },
                  scales: {
                    x: {
                      title: { display: true, text: 'Hour of Day' },
                      grid: { display: false },
                    },
                    y: {
                      title: { display: true, text: 'Event Count' },
                      beginAtZero: true,
                      grid: { color: '#e5e7eb' },
                      ticks: { stepSize: 1 }
                    },
                  },
                }}
                height={120}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`bg-white rounded shadow p-4 flex flex-col items-center ${highlight ? "border-2 border-red-500" : ""}`}>
      <div className="text-gray-500 text-sm mb-2">{label}</div>
      <div className={`text-3xl font-bold ${highlight ? "text-red-600" : "text-blue-700"}`}>{value}</div>
    </div>
  )
}
