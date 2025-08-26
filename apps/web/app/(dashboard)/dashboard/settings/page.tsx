"use client"
import browserSupabase from "@/app/lib/supabase-browser";
import { useState, useEffect } from "react"

export default function SettingsPage() {
  const [tab, setTab] = useState("general")
  const [billing, setBilling] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    (async () => {
      if (tab !== "billing") return;

      setLoading(true);

      // ✅ include the session access_token so API can identify the user
      const { data: { session } } = await browserSupabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("/api/settings/billing", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      setBilling(json);
      setLoading(false);

      // Inject Chargebee portal script if not already present
      if (!document.querySelector('script[data-cb-site="logicwerk"]')) {
        const script = document.createElement('script');
        script.src = "https://js.chargebee.com/v2/chargebee.js";
        script.setAttribute('data-cb-site', 'logicwerk');
        script.async = true;
        document.head.appendChild(script);
      }
    })();
  }, [tab])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="mb-4 flex gap-4 border-b">
        <button className={tabBtn(tab === "general")} onClick={() => setTab("general")}>General</button>
        <button className={tabBtn(tab === "billing")} onClick={() => setTab("billing")}>Billing</button>
      </div>
      {tab === "general" && <GeneralTab />}
      {tab === "billing" && <BillingTab billing={billing} loading={loading} />}
    </div>
  )
}

function tabBtn(active: boolean) {
  return `px-4 py-2 -mb-px border-b-2 ${active ? "border-blue-600 text-blue-700 font-bold" : "border-transparent text-gray-500"}`
}

function GeneralTab() {
  const [user, setUser] = useState<any>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [site, setSite] = useState<any>(null);
  const [webhook, setWebhook] = useState<string>("");
  const [autoBlock, setAutoBlock] = useState(false);
  const [threshold, setThreshold] = useState(2);
  const [saving, setSaving] = useState(false);

  // Fetch all sites on mount
  useEffect(() => {
    browserSupabase.auth.getUser().then(res => setUser(res.data.user));
    fetch("/api/sites").then(r => r.json()).then(data => {
      if (data.sites && data.sites.length > 0) {
        setSites(data.sites);
        setSite(data.sites[0]);
        setWebhook(data.sites[0]?.webhook_url || "");
        setAutoBlock(!!data.sites[0].auto_block_trial_abuse);
        setThreshold(Number(data.sites[0].trial_abuse_threshold) || 2);
      }
    });
  }, []);

  // When site changes, update settings fields
  useEffect(() => {
    if (!site) return;
    setWebhook(site.webhook_url || "");
    setAutoBlock(!!site.auto_block_trial_abuse);
    setThreshold(Number(site.trial_abuse_threshold) || 2);
  }, [site]);

  const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = sites.find(s => s.id === e.target.value);
    if (selected) setSite(selected);
  };

  const handleSave = async () => {
    if (!site) return;
    setSaving(true);
    await fetch(`/api/sites/${site.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auto_block_trial_abuse: autoBlock, trial_abuse_threshold: threshold })
    });
    // Refresh site list to get updated values
    const res = await fetch("/api/sites");
    const data = await res.json();
    setSites(data.sites);
    const updated = data.sites.find((s: any) => s.id === site.id);
    if (updated) setSite(updated);
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded shadow">
        <div className="font-semibold mb-2">Select Site</div>
        <select
          className="border px-2 py-1 rounded w-full mb-4"
          value={site?.id || ''}
          onChange={handleSiteChange}
          disabled={sites.length < 2}
        >
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.api_key?.slice(0, 8)}...)
            </option>
          ))}
        </select>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <div className="font-semibold mb-2">Account Info</div>
        <div>Email: <span className="font-mono">{user?.email || "-"}</span></div>
        <div>Created: <span className="font-mono">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}</span></div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <div className="font-semibold mb-2">API Settings</div>
        <div>Webhook URL: <span className="font-mono">{webhook || "-"}</span></div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <div className="font-semibold mb-2">Trial Abuse Protection</div>
        <div className="flex items-center gap-4 mb-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={autoBlock} onChange={e => setAutoBlock(e.target.checked)} />
            Enable auto-block for trial abuse
          </label>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <label>Threshold (unique emails per device):</label>
          <input
            type="number"
            min={2}
            className="border px-2 py-1 rounded w-16"
            value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            disabled={!autoBlock}
          />
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
          onClick={handleSave}
          disabled={saving}
        >{saving ? 'Saving...' : 'Save Settings'}</button>
      </div>
    </div>
  );
}

function BillingTab({ billing, loading }: { billing: any, loading: boolean }) {
  const pretty = (n: number) => (n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
  const used = billing?.used ?? 0;
  const quota = billing?.quota ?? 0;
  const percent = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded shadow">
        <div className="font-semibold mb-2">Current Plan</div>
        {loading ? "Loading..." : <div>{billing?.plan_label ?? "—"}</div>}
        {billing?.renewal_date && (
          <div className="text-sm text-gray-500 mt-1">
            Renews on {new Date(billing.renewal_date).toLocaleString()}
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="font-semibold mb-2">Usage This Billing Cycle</div>
        {loading ? "Loading..." : (
          <>
            <div className="text-lg">{pretty(used)} / {pretty(quota)} API calls</div>
            <div className="w-full bg-gray-200 h-2 rounded mt-3">
              <div className="bg-blue-600 h-2 rounded" style={{ width: `${percent}%` }} />
            </div>
          </>
        )}
      </div>

      <div className="flex gap-4 mt-2">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded inline-block"
          disabled={loading}
          onClick={async () => {
            try {
              const { data: { session } } = await browserSupabase.auth.getSession();
              if (!session) throw new Error('Not logged in');
              const res = await fetch('/api/chargebee/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: session.user.email })
              });
              const json = await res.json();
              if (json.url) {
                window.open(json.url, '_blank');
              } else {
                alert(json.error || 'Failed to open portal');
              }
            } catch (e: any) {
              alert(e.message || 'Failed to open portal');
            }
          }}
        >
          {loading ? 'Opening...' : 'Manage account'}
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded inline-block"
          disabled={loading}
          onClick={async () => {
            try {
              const { data: { session } } = await browserSupabase.auth.getSession();
              if (!session) throw new Error('Not logged in');
              const res = await fetch('/api/chargebee/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: session.user.email })
              });
              const json = await res.json();
              if (json.url) {
                window.open(json.url, '_blank');
              } else {
                alert(json.error || 'Failed to open portal');
              }
            } catch (e: any) {
              alert(e.message || 'Failed to open portal');
            }
          }}
        >
          {loading ? 'Opening...' : 'Upgrade Plan'}
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="font-semibold mb-2">Billing History</div>
        <div className="text-gray-400">(stub)</div>
      </div>
    </div>
  )
}
