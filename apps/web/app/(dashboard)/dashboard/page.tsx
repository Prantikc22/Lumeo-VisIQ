"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Top Countries</CardTitle>
              </CardHeader>
              <CardContent>
                <ul>
                  {stats.topCountries.length === 0 && <li className="text-gray-400">No data</li>}
                  {stats.topCountries.map(tc => (
                    <li key={tc.country} className="flex items-center justify-between">
                      <span>{tc.country}</span>
                      <span className="font-mono">{tc.count}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Risk Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold mb-1">Low</span><span className="text-2xl font-bold">{stats.riskBreakdown?.low ?? 0}</span></div>
                  <div className="flex flex-col items-center"><span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-bold mb-1">Medium</span><span className="text-2xl font-bold">{stats.riskBreakdown?.medium ?? 0}</span></div>
                  <div className="flex flex-col items-center"><span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold mb-1">High</span><span className="text-2xl font-bold">{stats.riskBreakdown?.high ?? 0}</span></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.recentActivity.length === 0 ? (
                  <div className="h-24 flex items-center justify-center text-gray-300">No recent events</div>
                ) : (
                  <Table className="text-xs">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Visitor</TableHead>
                        <TableHead>Risk</TableHead>
                        <TableHead>Country</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.recentActivity.map((ev, i) => (
                        <TableRow key={ev.id || i}>
                          <TableCell>{new Date(ev.timestamp).toLocaleTimeString()}</TableCell>
                          <TableCell>{ev.visitor_id?.slice(0, 6) || '-'}</TableCell>
                          <TableCell>{ev.properties?.verdict || '-'}</TableCell>
                          <TableCell>{ev.properties?.ip_country || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
          <Card className="mt-8">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Events Over Time</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <Card className={`flex flex-col items-center ${highlight ? 'border-red-500 border-2' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-gray-500 text-sm font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${highlight ? 'text-red-600' : 'text-blue-700'}`}>{value}</div>
      </CardContent>
    </Card>
  )
}
