"use client"
import { useEffect, useState } from "react"

interface ManualBlock {
  id: string
  type: "ip" | "fingerprint"
  value: string
  reason: string
  site_key: string
  created_at: string
  expires_at?: string
}

export default function BlocksPage() {
  const [blocks, setBlocks] = useState<ManualBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  // Store both id and api_key for each site
  const [sites, setSites] = useState<{ id: string; name: string; site_key: string }[]>([])
  const [selectedSiteKey, setSelectedSiteKey] = useState<string>("")
  const [siteNameFilter, setSiteNameFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort blocks
  const filteredBlocks = blocks.filter(block => {
    if (!siteNameFilter) return true;
    const site = sites.find(s => s.site_key === block.site_key);
    return site && site.name.toLowerCase().includes(siteNameFilter.toLowerCase());
  });
  filteredBlocks.sort((a, b) => {
    const dA = new Date(a.created_at).getTime();
    const dB = new Date(b.created_at).getTime();
    return sortOrder === 'desc' ? dB - dA : dA - dB;
  });

  const fetchBlocks = async (siteKey: string) => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/blocks?siteKey=${encodeURIComponent(siteKey)}`)
      if (!res.ok) throw new Error("Failed to fetch blocks")
      const data = await res.json()
      setBlocks(data.blocks)
    } catch (err: any) {
      setError(err.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Fetch sites first, then blocks
    const fetchSitesAndBlocks = async () => {
      try {
        const res = await fetch('/api/sites');
        if (!res.ok) throw new Error('Failed to fetch sites');
        const data = await res.json();
        if (!data.sites || !Array.isArray(data.sites) || data.sites.length === 0) {
          setError('No sites found. Please create a site first.');
          setLoading(false);
          return;
        }
        setSites(data.sites);
        // Do NOT auto-select the first site. Let user pick, or show all blocks for all sites for debugging.
        setSelectedSiteKey('');
        // fetchBlocks(data.sites[0].site_key); // Do not auto-fetch

      } catch (err: any) {
        setError(err.message || 'Unknown error fetching sites');
        setLoading(false);
      }
    };
    fetchSitesAndBlocks();
  }, [])

  useEffect(() => {
    if (selectedSiteKey) {
      fetchBlocks(selectedSiteKey);
    }
  }, [selectedSiteKey])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manual Blocks</h1>
      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          className="border px-2 py-1 rounded text-sm"
          type="text"
          placeholder="Filter by site name..."
          value={siteNameFilter}
          onChange={e => setSiteNameFilter(e.target.value)}
        />
        <select
          className="border px-2 py-1 rounded text-sm"
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {sites.length === 0 && !loading && (
        <div className="text-gray-500">No sites found. Please create a site first.</div>
      )}
      {sites.length > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <select
            className="border px-2 py-1 rounded text-sm"
            value={selectedSiteKey}
            onChange={e => setSelectedSiteKey(e.target.value)}
          >
            <option value="">-- Select site --</option>
            {sites.map(s => (
              <option key={s.site_key} value={s.site_key}>{s.name} ({s.site_key})</option>
            ))}
          </select>
          {selectedSiteKey && <button className="px-3 py-1 border rounded bg-blue-600 text-white" onClick={() => fetchBlocks(selectedSiteKey)}>Load Blocks</button>}
        </div>
      )}
      {sites.length > 0 && selectedSiteKey && !loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Value</th>
                <th className="px-4 py-2">Reason</th>
                <th className="px-4 py-2">Site</th>
                <th className="px-4 py-2">Created</th>
                <th className="px-4 py-2">Expires</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlocks.map(block => (
                <tr key={block.id} className="border-b">
                  <td className="px-4 py-2 text-xs font-mono">{block.type}</td>
                  <td className="px-4 py-2 font-mono text-xs">{block.value}</td>
                  <td className="px-4 py-2 text-xs">{block.reason}</td>
                  <td className="px-4 py-2 text-xs">{(sites.find(s => s.site_key === block.site_key)?.name) || block.site_key}</td>
                  <td className="px-4 py-2 text-xs">{new Date(block.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2 text-xs">{block.expires_at ? new Date(block.expires_at).toLocaleString() : "—"}</td>
                  <td className="px-4 py-2">
                    <button
                      className="text-red-600 hover:underline text-xs"
                      onClick={async () => {
                        await fetch(`/api/blocks/${block.id}`, { method: 'DELETE' });
                        fetchBlocks(selectedSiteKey);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {blocks.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No active blocks</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
