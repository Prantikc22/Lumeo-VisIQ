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
    const snippet = `<script async src=\"https://cdn.jsdelivr.net/npm/@logicwerk/visitoriq-sdk@1.3.0/dist/loader.min.js\" data-sitekey=\"${siteKey}\"></script>`;
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
      const data = await res.json();
      if (data.sites) setSites(data.sites);
      setModal({ type: 'success', message: 'Site deleted.' });
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
              <div className="font-semibold mb-2">How to use:</div>
              <ol className="text-xs mb-2 pl-4 list-decimal">
                <li>Copy the snippet below and add it to your website.</li>
                <li>Place it inside the <code>&lt;head&gt;</code> or just before <code>&lt;/body&gt;</code> in your HTML.</li>
                <li>For CMS (WordPress, Wix, Shopify), use the "Custom Code"/"Script" section.</li>
              </ol>
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
          {modal.type === 'howto' && (
            <div>
              <div className="font-semibold text-lg mb-2">How to Add VisitorIQ to Your Website</div>
              <div className="bg-yellow-100 text-yellow-900 p-2 rounded mb-3 text-xs border border-yellow-300">
                <b>Important:</b> For your actual site, <b>use the <i>Embed</i> button next to your site below</b> to get your unique snippet with your Site Key. The snippet below is for reference only—you must replace <code>YOUR_SITE_KEY</code> with your actual key.
              </div>
              <ol className="text-sm mb-4 pl-5 list-decimal">
                <li>Click the <b>Embed</b> button next to your site below to get your unique snippet.</li>
                <li>Copy the snippet and add it to your website.</li>
                <li>Paste it inside the <code>&lt;head&gt;</code> or just before the closing <code>&lt;/body&gt;</code> tag of your HTML.</li>
                <li>If you use a CMS (like WordPress, Wix, Shopify), insert it in the "Custom Code / Script" section.</li>
                <li>Add the snippet to all important pages for best protection and tracking.</li>
              </ol>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto mb-2">
{`<!-- VisitorIQ Snippet -->\n<script async\n  src="https://cdn.jsdelivr.net/npm/@logicwerk/visitoriq-sdk@1.3.0/dist/loader.min.js"\n  data-sitekey="YOUR_SITE_KEY">\n</script>\n<!-- End VisitorIQ Snippet -->`}
              </pre>
              <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs mb-2" onClick={() => {navigator.clipboard.writeText(`<!-- VisitorIQ Snippet -->\n<script async\n  src=\"https://cdn.jsdelivr.net/npm/@logicwerk/visitoriq-sdk@1.3.0/dist/loader.min.js\"\n  data-sitekey=\"YOUR_SITE_KEY\">\n</script>\n<!-- End VisitorIQ Snippet -->`); setModal({ type: 'success', message: 'Snippet copied!' });}}>Copy Snippet</button>
              <div className="text-xs text-gray-600 mt-2">
                The script will automatically identify visitors, enforce block rules, and collect visitor intelligence securely.
              </div>
              <button className="mt-4 bg-gray-300 text-gray-800 px-4 py-1 rounded text-xs" onClick={() => setModal(null)}>Close</button>
            </div>
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
                  // Show snippet modal directly after creation
                  const snippet = `<script async src=\"https://cdn.jsdelivr.net/npm/@logicwerk/visitoriq-sdk@1.3.0/dist/loader.min.js\" data-sitekey=\"${data.site.api_key}\"></script>`;
                  setModal({ type: 'snippet', snippet, message: `Embed this on your website for ${data.site.name}` });
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
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h1 className="text-2xl font-bold">Sites</h1>
          <div className="flex gap-2">
            <button
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded font-semibold shadow border border-blue-300 hover:bg-blue-200"
              onClick={() => setModal({ type: 'howto' })}
            >
              How to Add VisitorIQ
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded font-semibold shadow hover:bg-blue-700"
              onClick={() => setModal({ type: 'create' })}
            >
              Create New Site
            </button>
          </div>
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
