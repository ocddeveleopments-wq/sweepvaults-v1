"use client"

import Link from "next/link"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts"

export default function AdminDashboardClient({ stats }: { stats: any }) {
  const variantData = stats.leadsByVariant.map((v: any) => ({
    name: v.variant ?? "unknown",
    leads: v._count.id,
  }))

  const COLORS = ["#FFD700", "#FF4500", "#00FFFF", "#22C55E", "#FF00FF"]

  return (
    <div style={{ color: "#fff", minHeight: "100vh" }}>

      {/* Top bar */}
      <div style={{ padding: "20px 32px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "20px", fontWeight: 800 }}>Dashboard</div>
          <div style={{ fontSize: "12px", color: "#444", marginTop: "2px" }}>Welcome back — here's how SweepVaults is performing</div>
        </div>
        <Link href="/admin/offers/new" style={{ background: "#FFD700", color: "#000", padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>
          + Add Offer
        </Link>
      </div>

      <div style={{ padding: "28px 32px" }}>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "28px" }}>
          {[
            { label: "Total Leads", value: stats.totalLeads, sub: "all time", color: "#FFD700" },
            { label: "Email Captures", value: stats.emailLeads, sub: `${stats.emailConvRate}% conv rate`, color: "#22C55E" },
            { label: "Phone Upsells", value: stats.phoneLeads, sub: `${stats.phoneConvRate}% of emails`, color: "#FF4500" },
            { label: "Est. Revenue", value: `$${stats.revenue.toFixed(2)}`, sub: `${stats.activeOffers}/${stats.totalOffers} offers active`, color: "#00FFFF" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "20px" }}>
              <div style={{ fontSize: "11px", color: "#555", letterSpacing: "0.1em", marginBottom: "10px" }}>{s.label.toUpperCase()}</div>
              <div style={{ fontSize: "30px", fontWeight: 900, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</div>
              <div style={{ fontSize: "11px", color: "#444", marginTop: "6px" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "28px" }}>

          {/* Funnel */}
          <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "24px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#555", letterSpacing: "0.1em", marginBottom: "20px" }}>CONVERSION FUNNEL</div>
            {[
              { label: "Page Views", value: Math.max(stats.totalLeads * 4, 1), pct: 100, color: "#333" },
              { label: "Spin Clicked", value: Math.max(stats.totalLeads * 3, 0), pct: 75, color: "#444" },
              { label: "Email Captured", value: stats.emailLeads, pct: stats.emailConvRate, color: "#22C55E" },
              { label: "Phone Upsell", value: stats.phoneLeads, pct: stats.phoneConvRate, color: "#FF4500" },
            ].map((row) => (
              <div key={row.label} style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ fontSize: "12px", color: "#666" }}>{row.label}</span>
                  <span style={{ fontSize: "12px", color: "#444" }}>{row.value} · {row.pct}%</span>
                </div>
                <div style={{ height: "6px", background: "#1a1a1a", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${row.pct}%`, height: "100%", background: row.color, borderRadius: "3px", transition: "width 0.5s ease" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Variant performance */}
          <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "24px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#555", letterSpacing: "0.1em", marginBottom: "20px" }}>LEADS BY VARIANT</div>
            {variantData.length === 0 ? (
              <div style={{ color: "#333", fontSize: "13px", paddingTop: "20px" }}>No data yet — start running traffic</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={variantData} barSize={32}>
                  <XAxis dataKey="name" tick={{ fill: "#555", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                    cursor={{ fill: "#ffffff08" }}
                  />
                  <Bar dataKey="leads" radius={[4, 4, 0, 0]}>
                    {variantData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent leads */}
        <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#555", letterSpacing: "0.1em" }}>RECENT LEADS</div>
            <Link href="/admin/leads" style={{ fontSize: "12px", color: "#FFD700", textDecoration: "none" }}>View all →</Link>
          </div>
          {stats.recentLeads.length === 0 ? (
            <div style={{ color: "#333", fontSize: "13px" }}>No leads yet — start running traffic to your wheel pages!</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr>
                  {["Email", "Phone", "Variant", "Offer", "Payout", "Time"].map((h) => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#444", fontWeight: 500, fontSize: "11px", letterSpacing: "0.08em", borderBottom: "1px solid #1a1a1a" }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentLeads.map((lead: any) => (
                  <tr key={lead.id}>
                    <td style={{ padding: "10px 12px", color: "#22C55E", borderBottom: "1px solid #111" }}>{lead.email ?? "—"}</td>
                    <td style={{ padding: "10px 12px", color: lead.phone ? "#FF4500" : "#333", borderBottom: "1px solid #111" }}>{lead.phone ?? "—"}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #111" }}>
                      <span style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", padding: "2px 8px", color: "#FFD700", fontSize: "11px" }}>
                        {lead.variant ?? "—"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", color: "#666", borderBottom: "1px solid #111", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.offer.title}</td>
                    <td style={{ padding: "10px 12px", color: "#FFD700", fontWeight: 700, borderBottom: "1px solid #111" }}>${lead.offer.payout.toFixed(2)}</td>
                    <td style={{ padding: "10px 12px", color: "#444", borderBottom: "1px solid #111" }}>{new Date(lead.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  )
}