"use client"
import { useEffect, useState } from "react"

interface ClientApp {
  id: string
  name: string
  site_key: string
  created_at: string
  webhook_url?: string
}

export default function SitesPage() {
  const [sites, setSites] = useState<ClientApp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  // Modal state and handlers
  const [modal, setModal] = useState<{ type: string; message?: string; snippet?: string; site?: ClientApp } | null>(null);

  function handleCopy(siteKey: string, siteName: string) {
    if (!siteKey) {
      setModal({ type: 'error', message: 'Site key is undefined.' });
      return;
    }
    navigator.clipboard.writeText(siteKey);
    setModal({ type: 'success', message: `Copied site key for ${siteName}` });
  }

  function handleShowSnippet(siteKey: string, siteName: string) {
    const snippet = `<script src="https://cdn.visitoriq.com/v1.js" data-site-key="${siteKey}"></script>`;
    setModal({ type: 'snippet', snippet, message: `Embed this on your website for ${siteName}` });
  }

  function handleEdit(site: ClientApp) {
    setModal({ type: 'edit', site });
  }

  // Filtering and sorting state
  const [filter, setFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const filteredSites = sites
    .filter(site => site.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => sortOrder === 'desc'
      ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  // Edit Site Modal
  function EditSiteModal({ site }: { site: ClientApp }) {
    const [name, setName] = useState(site.name);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      setSubmitting(true);
      setError('');
      try {
        const res = await fetch(`/api/sites/${site.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name })
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to update site');
        }
        setModal({ type: 'success', message: 'Site name updated.' });
        fetchSites();
      } catch (err: any) {
        setError(err.message || 'Error updating site');
      } finally {
        setSubmitting(false);
      }
    }
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded shadow-lg p-6 min-w-[320px] max-w-[90vw]">
          <div className="mb-2 font-semibold">Edit Site Name</div>
          <form onSubmit={handleSubmit}>
            <input
              className="border rounded px-3 py-2 w-full mb-3"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              disabled={submitting}
            />
            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
            <div className="flex gap-2">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
                disabled={submitting || !name.trim()}
                type="submit"
              >{submitting ? 'Saving...' : 'Save'}</button>
              <button
                className="bg-gray-300 px-4 py-2 rounded text-sm"
                type="button"
                disabled={submitting}
                onClick={() => setModal(null)}
              >Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  async function handleDelete(site: ClientApp) {
    setModal({ type: 'confirmDelete', site });
  }

  async function confirmDelete(site: ClientApp) {
    try {
      const res = await fetch(`/api/sites/${site.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete site');
      setModal({ type: 'success', message: 'Site deleted.' });
      fetchSites();
    } catch (err: any) {
      setModal({ type: 'error', message: err.message || 'Delete failed' });
    }
  }

  function Modal() {
    if (!modal) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded shadow-lg p-6 min-w-[320px] max-w-[90vw]">
          {modal.type === 'success' && (<div className="text-green-700 font-semibold mb-4">{modal.message}</div>)}
          {modal.type === 'error' && (<div className="text-red-700 font-semibold mb-4">{modal.message}</div>)}
          {modal.type === 'snippet' && (
            <div>
              <div className="font-semibold mb-2">{modal.message}</div>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto mb-2">{modal.snippet}</pre>
              <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs" onClick={() => {navigator.clipboard.writeText(modal.snippet!); setModal({ type: 'success', message: 'Snippet copied!' });}}>Copy Snippet</button>
            </div>
          )}
          {modal.type === 'confirmDelete' && (
            <div>
              <div className="mb-4">Are you sure you want to delete <span className="font-semibold">{modal.site?.name}</span>?</div>
              <div className="flex gap-2">
                <button className="bg-red-600 text-white px-3 py-1 rounded text-xs" onClick={() => confirmDelete(modal.site!)}>Delete</button>
                <button className="bg-gray-300 px-3 py-1 rounded text-xs" onClick={() => setModal(null)}>Cancel</button>
              </div>
            </div>
          )}
          {modal.type === 'edit' && (
            <EditSiteModal site={modal.site!} />
          )}
          {(modal.type === 'success' || modal.type === 'error') && (
            <button className="mt-4 bg-blue-600 text-white px-3 py-1 rounded text-xs" onClick={() => setModal(null)}>Close</button>
          )}
        </div>
      </div>
    );
  }

  // Modal for site creation
  function SiteCreateModal() {
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    return modal?.type === 'create' ? (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded shadow-lg p-6 min-w-[320px] max-w-[90vw]">
          <div className="mb-2 font-semibold">Create New Site</div>
          <input
            className="border rounded px-3 py-2 w-full mb-4"
            type="text"
            placeholder="Site name or URL"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
              disabled={submitting || !name.trim()}
              onClick={async () => {
                setSubmitting(true);
                try {
                  const res = await fetch("/api/sites", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name }),
                  });
                  if (!res.ok) throw new Error("Failed to create site");
                  fetchSites();
                  const data = await res.json();
                  setModal({ type: 'success', message: `Site created! Site key: ${data.site.api_key}` });
                } catch (err: any) {
                  setModal({ type: 'error', message: err.message || 'Failed to create site' });
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {submitting ? 'Creating...' : 'Create'}
            </button>
            <button className="bg-gray-300 px-4 py-2 rounded text-sm" onClick={() => setModal(null)} disabled={submitting}>Cancel</button>
          </div>
        </div>
      </div>
    ) : null;
  }

  const fetchSites = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/sites")
      if (!res.ok) throw new Error("Failed to fetch sites")
      const data = await res.json()
      setSites(data.sites)
    } catch (err: any) {
      setError(err.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSites()
  }, [])

  return (
    <div>
      <Modal />
      <SiteCreateModal />
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Sites</h1>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded font-semibold shadow hover:bg-blue-700"
            onClick={() => setModal({ type: 'create' })}
          >
            Create New Site
          </button>
        </div>
        <div className="flex flex-wrap gap-2 items-center mt-2">
          <input
            className="border px-2 py-1 rounded text-sm"
            type="text"
            placeholder="Filter by site name..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ minWidth: 180 }}
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
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Site Key</th>
              <th className="px-4 py-2 text-left">Created</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sites.map(site => (
              <tr key={site.id} className="border-b">
                <td className="px-4 py-2">{site.name}</td>
                <td className="px-4 py-2 font-mono text-xs flex items-center gap-2">
                  {site.site_key}
                  <button className="text-blue-500 hover:underline" title="Copy Site Key" onClick={() => handleCopy(site.site_key, site.name)}>Copy</button>
                  <button className="text-gray-500 text-xs border rounded px-2 py-1 ml-2" title="Show Embed Snippet" onClick={() => handleShowSnippet(site.site_key, site.name)}>Embed</button>
                </td>
                <td className="px-4 py-2 text-xs">{new Date(site.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button className="text-blue-600 hover:underline text-xs" onClick={() => handleEdit(site)}>Edit</button>
                  <button className="text-red-600 hover:underline text-xs" onClick={() => handleDelete(site)}>Delete</button>
                </td>
              </tr>
            ))}
            {sites.length === 0 && !loading && (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No sites found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
