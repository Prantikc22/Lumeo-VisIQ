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
      if (!document.querySelector('script[data-cb-site="logicwerk-test"]')) {
        const script = document.createElement('script');
        script.src = "https://js.chargebee.com/v2/chargebee.js";
        script.setAttribute('data-cb-site', 'logicwerk-test');
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
  const [webhook, setWebhook] = useState<string>("");
  useEffect(() => {
    browserSupabase.auth.getUser().then(res => setUser(res.data.user));
    fetch("/api/sites").then(r => r.json()).then(data => {
      if (data.sites && data.sites[0]?.webhook_url) setWebhook(data.sites[0].webhook_url);
    });
  }, []);
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded shadow">
        <div className="font-semibold mb-2">Account Info</div>
        <div>Email: <span className="font-mono">{user?.email || "-"}</span></div>
        <div>Created: <span className="font-mono">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}</span></div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <div className="font-semibold mb-2">API Settings</div>
        <div>Webhook URL: <span className="font-mono">{webhook || "-"}</span></div>
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

      <a
        href="https://logicwerk-test.chargebeeportal.com"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-blue-600 text-white px-4 py-2 rounded inline-block"
      >
        Manage account
      </a>

      <div className="bg-white p-4 rounded shadow">
        <div className="font-semibold mb-2">Billing History</div>
        <div className="text-gray-400">(stub)</div>
      </div>
    </div>
  )
}
