"use client"
import { useEffect, useState } from "react"

interface VisitorEvent {
  id: string
  created_at: string
  timestamp?: string
  ip: string
  ip_city: string
  ip_country: string
  ip_org: string
  fingerprint_hash: string
  risk_score: number
  verdict: string
  signals: string[]
  site_id: string
  properties?: {
    visit_count?: number;
    suspicious?: boolean;
    suspiciousReason?: string;
    [key: string]: any;
  }
}

const VERDICT_COLORS = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700"
}

function AccordionSection({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded mb-2 bg-white">
      <button
        className="w-full flex justify-between items-center px-4 py-2 font-semibold text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-t focus:outline-none"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="ml-2">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="px-4 py-2 text-xs">{children}</div>}
    </div>
  );
}

function SmartSignals({ details }: { details: any }) {
  const [showJson, setShowJson] = useState(false);

  function renderFormatted(details: any) {
    if (!details || typeof details !== 'object') return <div>No details available.</div>;
    return (
      <div className="space-y-2">
        {details.info && (
          <AccordionSection title="Info" defaultOpen={true}>
            <div><b>Uniqueness Score:</b> <span className="font-mono bg-gray-100 px-2 py-1 rounded">{details.info.score ?? details.info["score"] ?? 'N/A'}</span></div>
            {Object.entries(details.info).map(([k, v]) => k !== 'score' && (
              <div key={k}>
                <b>{k}:</b> <span className="font-mono">{typeof v === 'object' ? <pre className="inline whitespace-pre-wrap">{JSON.stringify(v, null, 2)}</pre> : String(v)}</span>
              </div>
            ))}
          </AccordionSection>
        )}
        {details.version && (
          <AccordionSection title="Version" defaultOpen={false}>
            <span className="font-mono">{details.version}</span>
          </AccordionSection>
        )}
        {details.thumbmark && (
          <AccordionSection title="Thumbmark" defaultOpen={false}>
            <span className="font-mono break-all">{details.thumbmark}</span>
          </AccordionSection>
        )}
        {details.components && (
          <AccordionSection title="Components" defaultOpen={false}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(details.components).map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded p-2 shadow-sm">
                  <b>{k}:</b>
                  <div className="font-mono text-xs break-all max-h-24 overflow-y-auto">
                    {typeof v === 'object' ? <pre>{JSON.stringify(v, null, 2)}</pre> : String(v)}
                  </div>
                </div>
              ))}
            </div>
          </AccordionSection>
        )}
      </div>
    );
  }

  return (
    <div className="mt-2 bg-gray-50 rounded p-3 shadow-inner max-h-[60vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <b className="text-sm">Smart Signals</b>
        <button
          className="ml-4 text-xs px-2 py-1 border rounded bg-white hover:bg-gray-100 transition"
          onClick={() => setShowJson(v => !v)}
        >
          {showJson ? 'Formatted View' : 'JSON View'}
        </button>
      </div>
      {showJson ? (
        <pre className="text-xs bg-gray-100 rounded p-2 overflow-x-auto max-h-60 border">{JSON.stringify(details, null, 2)}</pre>
      ) : (
        renderFormatted(details)
      )}
    </div>
  );
}


function VisitorDetailsDialog({ viewEvent, onClose }: { viewEvent: any, onClose: () => void }) {
  const [showJson, setShowJson] = useState(false);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-0 w-full max-w-3xl max-h-[90vh] md:max-w-[95vw] relative border border-gray-200 overflow-hidden">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose} aria-label="Close">✕</button>
        <div className="flex flex-col md:flex-row h-full">
          <div className="flex-1 p-8 overflow-y-auto max-h-[80vh] min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-extrabold tracking-tight">Visitor Details</h2>
              <button
                className="ml-4 text-xs px-3 py-1 border rounded bg-white hover:bg-gray-100 transition font-semibold"
                onClick={() => setShowJson(v => !v)}
              >
                {showJson ? 'Formatted View' : 'JSON View'}
              </button>
            </div>
            {showJson ? (
              <pre className="text-xs bg-gray-100 rounded p-4 overflow-x-auto max-h-[60vh] border font-mono whitespace-pre-wrap">{JSON.stringify(viewEvent, null, 2)}</pre>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                    <div className="mb-2 text-xs text-gray-500 font-bold uppercase tracking-wider">Network</div>
                    <div><b>IP:</b> <span className="font-mono">{viewEvent.ip}</span></div>
                    <div><b>Location:</b> {viewEvent.ip_city}, {viewEvent.ip_country}</div>
                    <div><b>Org:</b> {viewEvent.ip_org}</div>
                    <div><b>Timestamp:</b> {viewEvent.timestamp || viewEvent.created_at}</div>
                    <div><b>Referrer:</b> <span className="break-all">{viewEvent.referrer}</span></div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                    <div className="mb-2 text-xs text-gray-500 font-bold uppercase tracking-wider">Device & Risk</div>
                    <div><b>Fingerprint:</b> <span className="font-mono">{viewEvent.fingerprint_hash}</span></div>
                    <div><b>Risk:</b> <span className={riskColor(viewEvent.risk_score) + " px-2 py-1 rounded font-bold"}>{viewEvent.risk_score}</span></div>
                    <div><b>Verdict:</b> <span className="capitalize">{viewEvent.verdict}</span></div>
                    <div><b>Browser:</b> {viewEvent.properties?.browser || ''}</div>
                    <div><b>OS:</b> {viewEvent.properties?.os || ''}</div>
                    <div><b>Resolution:</b> {viewEvent.properties?.resolution || ''}</div>
                    <div><b>Timezone:</b> {viewEvent.properties?.timezone || ''}</div>
                    <div><b>User Agent:</b> <span className="break-all">{viewEvent.properties?.userAgent || ''}</span></div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                    <div className="mb-2 text-xs text-gray-500 font-bold uppercase tracking-wider">Detection</div>
                    <div><b>VPN Detected:</b> {viewEvent.properties?.vpnDetected === true ? 'Yes' : viewEvent.properties?.vpnDetected === false ? 'No' : 'Unknown'}</div>
                    <div><b>Bot Detected (Heuristic):</b> {viewEvent.properties?.is_bot === true ? 'Yes' : viewEvent.properties?.is_bot === false ? 'No' : 'Unknown'}</div>
                    <div><b>BotD OSS:</b> {(() => {
                      const botd = viewEvent.properties?.botd_result;
                      if (!botd) return 'Unknown';
                      if (botd.bot) return 'Detected (' + botd.bot.name + ')';
                      return botd.result === 'notDetected' ? 'Not Detected' : JSON.stringify(botd);
                    })()}</div>
                    <div><b>Tor Exit Node:</b> {viewEvent.properties?.is_tor === true ? 'Yes' : viewEvent.properties?.is_tor === false ? 'No' : 'Unknown'}</div>
                    <div><b>Proxy IP:</b> {viewEvent.properties?.is_proxy === true ? 'Yes' : viewEvent.properties?.is_proxy === false ? 'No' : 'Unknown'}</div>
                    <div><b>Disposable Email:</b> {viewEvent.properties?.is_temp_email === true ? 'Yes' : viewEvent.properties?.is_temp_email === false ? 'No' : 'Unknown'}</div>
                  </div>
                                  </div>
                <div className="mt-6">
  <h3 className="font-semibold mb-2">Advanced Signals</h3>
  <div className="bg-gray-50 rounded p-4 text-xs whitespace-pre-wrap overflow-x-auto border">
    <ul className="list-disc ml-6">
      {viewEvent?.properties?.gps_location && (
        <li>
          <span className="font-semibold">GPS Location:</span> {`Lat: ${viewEvent.properties.gps_location.lat}, Lon: ${viewEvent.properties.gps_location.lon}, Accuracy: ${viewEvent.properties.gps_location.accuracy || 'N/A'}`}
        </li>
      )}
      {viewEvent?.properties?.gps_permission && (
        <li>
          <span className="font-semibold">GPS Permission:</span> {viewEvent.properties.gps_permission}
        </li>
      )}
      {viewEvent?.properties?.emulator_detected !== undefined && (
        <li>
          <span className="font-semibold">Emulator Detected:</span> {viewEvent.properties.emulator_detected ? 'Yes' : 'No'}
          {Array.isArray(viewEvent.properties.emulator_reasons) && viewEvent.properties.emulator_reasons.length > 0 && (
            <ul className="list-disc ml-6 mt-1 text-gray-600">
              {viewEvent.properties.emulator_reasons.map((reason: string, idx: number) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          )}
        </li>
      )}
      {viewEvent?.properties?.geo_mismatch !== undefined && (
        <li>
          <span className="font-semibold">Geolocation Mismatch:</span> {viewEvent.properties.geo_mismatch ? 'Yes' : 'No'}
        </li>
      )}
      {viewEvent?.properties?.location_spoofed !== undefined && (
        <li>
          <span className="font-semibold">Location Spoofed:</span> {viewEvent.properties.location_spoofed ? 'Yes' : 'No'}
        </li>
      )}
    </ul>
  </div>
</div>
                {viewEvent.properties?.thumbmark_details && Object.keys(viewEvent.properties.thumbmark_details).length > 0 && (
                  <SmartSignals details={viewEvent.properties.thumbmark_details} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleString();
}

function relativeTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return `${diff} seconds ago`
  if (diff < 3600) return `${Math.floor(diff/60)} minutes ago`
  if (diff < 86400) return `${Math.floor(diff/3600)} hours ago`
  return date.toLocaleString()
}

function riskColor(score: number) {
  if (score < 30) return "bg-green-100 text-green-700"
  if (score < 70) return "bg-yellow-100 text-yellow-700"
  return "bg-red-100 text-red-700"
}

function SignalIcon({ signal }: { signal: string }) {
  // Simple icon mapping
  const icons: Record<string, string> = {
    vpn: "🔒", incognito: "🕵️", velocity: "⚡", abuse: "🚫", timezone: "🌐", webdriver: "🤖"
  }
  return <span title={signal}>{icons[signal] || "❓"}</span>
}

export default function VisitorsPage() {
  const [sites, setSites] = useState<{ id: string; name: string; api_key: string }[]>([]);
  const [events, setEvents] = useState<VisitorEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [viewEvent, setViewEvent] = useState<VisitorEvent|null>(null)
  const [actionMsg, setActionMsg] = useState<string>("")

  // Filter and sort state
  const [siteFilter, setSiteFilter] = useState('');
  const [fpFilter, setFpFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('');
  const [locFilter, setLocFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtering, sorting, and grouping
  const filteredEvents = events.filter(ev => {
    const site = sites.find(s => s.id === ev.site_id);
    return (
      (!siteFilter || (site?.name || '').toLowerCase().includes(siteFilter.toLowerCase())) &&
      (!fpFilter || (ev.fingerprint_hash || '').toLowerCase().includes(fpFilter.toLowerCase())) &&
      (!riskFilter || String(ev.risk_score).includes(riskFilter)) &&
      (!verdictFilter || (ev.verdict || '').toLowerCase().includes(verdictFilter.toLowerCase())) &&
      (!locFilter || ((ev.ip_city || '') + (ev.ip_country || '')).toLowerCase().includes(locFilter.toLowerCase()))
    );
  });
  filteredEvents.sort((a, b) => {
    const dA = new Date(a.timestamp || a.created_at).getTime();
    const dB = new Date(b.timestamp || b.created_at).getTime();
    return sortOrder === 'desc' ? dB - dA : dA - dB;
  });
  const groupedEvents = filteredEvents.reduce((acc: Record<string, VisitorEvent[]>, ev) => {
    (acc[ev.site_id] = acc[ev.site_id] || []).push(ev);
    return acc;
  }, {});

  const fetchEvents = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/visitors")
      if (!res.ok) throw new Error("Failed to fetch visitor events")
      const data = await res.json()
      setEvents(data.events)
    } catch (err: any) {
      setError(err.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents();
    fetch('/api/sites')
      .then(res => res.json())
      .then(data => setSites(data.sites || []));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Visitors</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {/* Filter & Sort Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input className="border px-2 py-1 rounded text-sm" type="text" placeholder="Filter by site name..." value={siteFilter} onChange={e => setSiteFilter(e.target.value)} />
        <input className="border px-2 py-1 rounded text-sm" type="text" placeholder="Fingerprint..." value={fpFilter} onChange={e => setFpFilter(e.target.value)} />
        <input className="border px-2 py-1 rounded text-sm" type="text" placeholder="Risk..." value={riskFilter} onChange={e => setRiskFilter(e.target.value)} />
        <input className="border px-2 py-1 rounded text-sm" type="text" placeholder="Verdict..." value={verdictFilter} onChange={e => setVerdictFilter(e.target.value)} />
        <input className="border px-2 py-1 rounded text-sm" type="text" placeholder="Location..." value={locFilter} onChange={e => setLocFilter(e.target.value)} />
        <select className="border px-2 py-1 rounded text-sm" value={sortOrder} onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}>
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>
      {/* Accordion by Site */}
      <div className="space-y-3">
        {Object.entries(groupedEvents).map(([siteId, siteEvents]) => {
          const site = sites.find(s => s.id === siteId);
          return (
            <AccordionSection key={siteId} title={site?.name || siteId} defaultOpen={true}>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded shadow text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left">Timestamp</th>
                      <th className="px-4 py-2 text-left">IP</th>
                      <th className="px-4 py-2 text-left">Location</th>
                      <th className="px-4 py-2 text-left">Org</th>
                      <th className="px-4 py-2 text-left">Fingerprint</th>
                      <th className="px-4 py-2 text-left">Visits</th>
                      <th className="px-4 py-2 text-left">Suspicious</th>
                      <th className="px-4 py-2 text-left">Risk</th>
                      <th className="px-4 py-2 text-left">Verdict</th>
                      <th className="px-4 py-2 text-left">Signals</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siteEvents.map(event => (
                      <tr key={event.id} className="border-b">
                        <td className="px-4 py-2 text-xs whitespace-nowrap" title={event.timestamp || event.created_at}>{relativeTime(event.timestamp || event.created_at)}<br/><span className="text-gray-400 text-[10px]">{formatDate(event.timestamp || event.created_at)}</span></td>
                        <td className="px-4 py-2 font-mono text-xs">{event.ip}</td>
                        <td className="px-4 py-2 text-xs">{(event.ip_city || event.ip_country) ? `${event.ip_city || ''}${event.ip_city && event.ip_country ? ', ' : ''}${event.ip_country || ''}` : '—'}</td>
                        <td className="px-4 py-2 text-xs">{event.ip_org || '—'}</td>
                        <td className="px-4 py-2 font-mono text-xs" title={event.fingerprint_hash}>{event.fingerprint_hash.slice(0,8)}...</td>
                        <td className="px-4 py-2 text-xs">{event.properties?.visit_count ?? '—'}</td>
                        <td className="px-4 py-2 text-xs">
                          {event.properties?.suspicious ? (
                            <span className="inline-block bg-yellow-100 text-yellow-800 rounded px-2 py-1 text-xs font-semibold" title={event.properties?.suspiciousReason || ''}>
                              Suspicious{event.properties?.suspiciousReason ? `: ${event.properties.suspiciousReason}` : ''}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-2">
                          <span className={riskColor(event.risk_score) + " px-2 py-1 rounded text-xs font-bold"}>{event.risk_score}</span>
                        </td>
                        <td className="px-4 py-2">
                          <span className={VERDICT_COLORS[event.verdict as keyof typeof VERDICT_COLORS] + " px-2 py-1 rounded text-xs font-bold"}>{event.verdict}</span>
                        </td>
                        <td className="px-4 py-2">
  <div className="flex flex-col gap-1 items-start">
    <div className="flex gap-1 items-center mb-1">
      {event.signals.map(sig => <SignalIcon key={sig} signal={sig} />)}
    </div>
    <button className="text-blue-600 hover:underline text-xs font-semibold" onClick={() => setViewEvent(event)}>View</button>
  </div>
</td>
                        <td className="px-4 py-2 min-w-[120px]">
  <div className="flex flex-col gap-1">
    <button className="text-red-600 hover:underline text-xs font-semibold border border-red-200 rounded px-2 py-0.5" title="Block this IP" onClick={async () => {
      setActionMsg('');
      const site = sites.find(s => s.id === event.site_id);
      const siteKey = site?.api_key || '';
      const res = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'ip', value: event.ip, reason: 'Manual block from dashboard', site_key: siteKey })
      });
      if (res.ok) {
        setActionMsg('Blocked IP successfully');
        fetchEvents();
      } else {
        setActionMsg('Failed to block IP');
      }
    }}>Block IP</button>
    <button className="text-yellow-700 hover:underline text-xs font-semibold border border-yellow-200 rounded px-2 py-0.5" title="Block this fingerprint" onClick={async () => {
      setActionMsg('');
      const site = sites.find(s => s.id === event.site_id);
      const siteKey = site?.api_key || '';
      const res = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'fingerprint', value: event.fingerprint_hash, reason: 'Manual block from dashboard', site_key: siteKey })
      });
      if (res.ok) {
        setActionMsg('Blocked fingerprint successfully');
        fetchEvents();
      } else {
        setActionMsg('Failed to block fingerprint');
      }
    }}>Block FP</button>
  </div>
</td>
                      </tr>
                    ))}
                    {siteEvents.length === 0 && !loading && (
                      <tr><td colSpan={9} className="text-center py-8 text-gray-400">No visitor events found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </AccordionSection>
          );
        })}
        {Object.keys(groupedEvents).length === 0 && !loading && (
          <div className="text-center py-8 text-gray-400">No visitor events found</div>
        )}
      </div>
    {viewEvent && (
      <VisitorDetailsDialog viewEvent={viewEvent} onClose={() => setViewEvent(null)} />
    )}
    {actionMsg && <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow z-50">{actionMsg}</div>}
  </div>
  )
}

