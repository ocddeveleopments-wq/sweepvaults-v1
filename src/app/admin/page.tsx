import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const dynamic = "force-dynamic"

async function getStats() {
  const [totalLeads, emailLeads, phoneLeads, totalOffers, activeOffers, recentLeads] =
    await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { email: { not: null } } }),
      prisma.lead.count({ where: { phone: { not: null } } }),
      prisma.offer.count(),
      prisma.offer.count({ where: { active: true } }),
      prisma.lead.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { offer: { select: { title: true, payout: true } } },
      }),
    ])

  const revenue = emailLeads * 2.0
  const phoneRevenue = phoneLeads * 0.5

  return {
    totalLeads,
    emailLeads,
    phoneLeads,
    totalOffers,
    activeOffers,
    recentLeads,
    revenue: revenue + phoneRevenue,
  }
}

export default async function AdminPage() {
  const stats = await getStats()

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "system-ui" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #222", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: "20px", fontWeight: 800, color: "#FFD700" }}>SweepVaults Admin</div>
        <div style={{ display: "flex", gap: "16px" }}>
          <Link href="/admin" style={{ color: "#FFD700", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>Dashboard</Link>
          <Link href="/admin/offers" style={{ color: "#888", textDecoration: "none", fontSize: "14px" }}>Offers</Link>
          <Link href="/admin/leads" style={{ color: "#888", textDecoration: "none", fontSize: "14px" }}>Leads</Link>
        </div>
      </div>

      <div style={{ padding: "32px" }}>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
          {[
            { label: "Total Leads", value: stats.totalLeads, color: "#FFD700" },
            { label: "Email Captures", value: stats.emailLeads, color: "#22C55E" },
            { label: "Phone Upsells", value: stats.phoneLeads, color: "#FF4500" },
            { label: "Est. Revenue", value: `$${stats.revenue.toFixed(2)}`, color: "#00FFFF" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#111", border: "1px solid #222", borderRadius: "12px", padding: "20px" }}>
              <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px", letterSpacing: "0.08em" }}>{s.label.toUpperCase()}</div>
              <div style={{ fontSize: "32px", fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Funnel */}
        <div style={{ background: "#111", border: "1px solid #222", borderRadius: "12px", padding: "24px", marginBottom: "32px" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "20px", letterSpacing: "0.06em" }}>CONVERSION FUNNEL</div>
          {[
            { label: "Page Views", value: stats.totalLeads > 0 ? stats.totalLeads * 4 : 0, pct: 100, color: "#444" },
            { label: "Spin Clicked", value: stats.totalLeads > 0 ? stats.totalLeads * 3 : 0, pct: 75, color: "#666" },
            { label: "Email Captured", value: stats.emailLeads, pct: stats.totalLeads > 0 ? Math.round((stats.emailLeads / (stats.totalLeads * 4)) * 100) : 0, color: "#22C55E" },
            { label: "Phone Upsell", value: stats.phoneLeads, pct: stats.totalLeads > 0 ? Math.round((stats.phoneLeads / (stats.totalLeads * 4)) * 100) : 0, color: "#FF4500" },
          ].map((row) => (
            <div key={row.label} style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
              <div style={{ width: "120px", fontSize: "12px", color: "#888" }}>{row.label}</div>
              <div style={{ flex: 1, background: "#1a1a1a", borderRadius: "4px", height: "28px", overflow: "hidden" }}>
                <div style={{ width: `${row.pct}%`, height: "100%", background: row.color, borderRadius: "4px", display: "flex", alignItems: "center", paddingLeft: "10px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#fff" }}>{row.value}</span>
                </div>
              </div>
              <div style={{ width: "40px", fontSize: "12px", color: "#666", textAlign: "right" }}>{row.pct}%</div>
            </div>
          ))}
        </div>

        {/* Active offers */}
        <div style={{ background: "#111", border: "1px solid #222", borderRadius: "12px", padding: "24px", marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff", letterSpacing: "0.06em" }}>OFFERS ({stats.activeOffers} active)</div>
            <Link href="/admin/offers/new" style={{ background: "#FFD700", color: "#000", padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, textDecoration: "none" }}>+ Add Offer</Link>
          </div>
          <Link href="/admin/offers" style={{ color: "#888", fontSize: "13px", textDecoration: "none" }}>Manage all offers →</Link>
        </div>

        {/* Recent leads */}
        <div style={{ background: "#111", border: "1px solid #222", borderRadius: "12px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff", letterSpacing: "0.06em" }}>RECENT LEADS</div>
            <Link href="/admin/leads" style={{ color: "#{stats.recentLeads.map((lead: any) => (888", fontSize: "13px", textDecoration: "none" }}>View all →</Link>
          </div>
          {stats.recentLeads.length === 0 ? (
            <div style={{ color: "#444", fontSize: "13px" }}>No leads yet — start running traffic!</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #222" }}>
                  {["Email", "Phone", "Offer", "Payout", "Time"].map((h) => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#666", fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentLeads.map((lead: any) => (
                  <tr key={lead.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                    <td style={{ padding: "10px 12px", color: "#22C55E" }}>{lead.email ?? "—"}</td>
                    <td style={{ padding: "10px 12px", color: "#FF4500" }}>{lead.phone ?? "—"}</td>
                    <td style={{ padding: "10px 12px", color: "#aaa" }}>{lead.offer.title.substring(0, 30)}...</td>
                    <td style={{ padding: "10px 12px", color: "#FFD700" }}>${lead.offer.payout.toFixed(2)}</td>
                    <td style={{ padding: "10px 12px", color: "#555" }}>{new Date(lead.createdAt).toLocaleTimeString()}</td>
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