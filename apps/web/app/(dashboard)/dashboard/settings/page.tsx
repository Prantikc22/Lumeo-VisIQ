"use client"
import { useState, useEffect } from "react"

export default function SettingsPage() {
  const [tab, setTab] = useState("general")
  const [billing, setBilling] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (tab === "billing") {
      setLoading(true)
      fetch("/api/settings/billing").then(r => r.json()).then(setBilling).finally(() => setLoading(false))
    }
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

import browserSupabase from "@/app/lib/supabase-browser";
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
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded shadow">
        <div className="font-semibold mb-2">Current Plan</div>
        {loading ? "Loading..." : <div>{billing?.plan || "Free"}</div>}
      </div>
      <div className="bg-white p-4 rounded shadow">
        <div className="font-semibold mb-2">Usage This Month</div>
        {loading ? "Loading..." : <div>{billing?.usage || 0} / {billing?.quota || 10000}</div>}
      </div>
      <button className="bg-gray-300 text-gray-500 px-4 py-2 rounded cursor-not-allowed" disabled>Upgrade Plan</button>
      <div className="bg-white p-4 rounded shadow">
        <div className="font-semibold mb-2">Billing History</div>
        <div className="text-gray-400">(stub)</div>
      </div>
    </div>
  )
}

