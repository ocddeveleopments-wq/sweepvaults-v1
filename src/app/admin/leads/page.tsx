import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { offer: { select: { title: true, payout: true } } },
  })

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "system-ui" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #222", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: "20px", fontWeight: 800, color: "#FFD700" }}>SweepVaults Admin</div>
        <div style={{ display: "flex", gap: "16px" }}>
          <Link href="/admin" style={{ color: "#888", textDecoration: "none", fontSize: "14px" }}>Dashboard</Link>
          <Link href="/admin/offers" style={{ color: "#888", textDecoration: "none", fontSize: "14px" }}>Offers</Link>
          <Link href="/admin/leads" style={{ color: "#FFD700", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>Leads</Link>
        </div>
      </div>

      <div style={{ padding: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "22px", fontWeight: 800 }}>Leads <span style={{ fontSize: "14px", color: "#666", fontWeight: 400 }}>({leads.length} shown)</span></div>
          <div style={{ fontSize: "13px", color: "#666" }}>Last 100 leads</div>
        </div>

        {leads.length === 0 ? (
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: "12px", padding: "40px", textAlign: "center", color: "#444" }}>
            No leads yet — start running traffic to your wheel pages!
          </div>
        ) : (
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: "12px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #222", background: "#0d0d0d" }}>
                  {["Email", "Phone", "Variant", "Locale", "Offer", "Payout", "Country", "Date"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#555", fontWeight: 500, letterSpacing: "0.06em", fontSize: "11px" }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead: any) => (
                  <tr key={lead.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                    <td style={{ padding: "12px 16px", color: "#22C55E" }}>{lead.email ?? "—"}</td>
                    <td style={{ padding: "12px 16px", color: lead.phone ? "#FF4500" : "#333" }}>{lead.phone ?? "—"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", padding: "2px 8px", color: "#FFD700", fontSize: "11px" }}>
                        {lead.variant ?? "—"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#888" }}>{lead.locale}</td>
                    <td style={{ padding: "12px 16px", color: "#aaa", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.offer.title}</td>
                    <td style={{ padding: "12px 16px", color: "#FFD700", fontWeight: 700 }}>${lead.offer.payout.toFixed(2)}</td>
                    <td style={{ padding: "12px 16px", color: "#666" }}>{lead.country ?? "—"}</td>
                    <td style={{ padding: "12px 16px", color: "#555" }}>
                      {new Date(lead.createdAt).toLocaleDateString()} {new Date(lead.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}