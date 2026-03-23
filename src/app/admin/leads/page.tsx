import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { offer: { select: { title: true, payout: true } } },
  })

  const totalConverted = leads.filter((l: any) => l.converted).length
  const totalRevenue = totalConverted * 2.0

  return (
    <div style={{ color: "#fff", minHeight: "100vh" }}>
      <div style={{ padding: "20px 32px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "20px", fontWeight: 800 }}>Leads</div>
          <div style={{ fontSize: "12px", color: "#444", marginTop: "2px" }}>{leads.length} total · {totalConverted} confirmed conversions</div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "8px", padding: "10px 16px", textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "#555", marginBottom: "4px" }}>CONVERSIONS</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#22C55E" }}>{totalConverted}</div>
          </div>
          <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "8px", padding: "10px 16px", textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "#555", marginBottom: "4px" }}>REVENUE</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#FFD700" }}>${totalRevenue.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "28px 32px" }}>

        {/* Postback URL */}
        <div style={{ background: "#0d1a0d", border: "1px solid #22C55E30", borderRadius: "12px", padding: "16px 20px", marginBottom: "24px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#22C55E", marginBottom: "6px", letterSpacing: "0.08em" }}>MAXBOUNTY POSTBACK URL</div>
          <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#aaa", background: "#0a0a0a", padding: "10px 14px", borderRadius: "6px", marginBottom: "8px", wordBreak: "break-all" }}>
            https://www.sweepvaults.com/api/postback?subid={"{s2}"}&payout={"{payout}"}&offer_id={"{offer_id}"}
          </div>
          <div style={{ fontSize: "11px", color: "#555" }}>Add this as your Global Postback URL in MaxBounty → Profile → Global Postback</div>
        </div>

        {leads.length === 0 ? (
          <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "40px", textAlign: "center", color: "#444" }}>
            No leads yet — start running traffic to your wheel pages!
          </div>
        ) : (
          <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#0d0d0d" }}>
                  {["Status", "Name", "Email", "Phone", "Variant", "Offer", "Payout", "UTM Source", "Date"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#444", fontWeight: 500, fontSize: "11px", letterSpacing: "0.08em", borderBottom: "1px solid #1a1a1a" }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead: any) => (
                  <tr key={lead.id} style={{ borderBottom: "1px solid #111" }}>
                    <td style={{ padding: "12px 16px" }}>
                      {lead.converted ? (
                        <span style={{ background: "#0d1a0d", border: "1px solid #22C55E40", borderRadius: "4px", padding: "2px 8px", color: "#22C55E", fontSize: "11px", fontWeight: 700 }}>
                          ✓ CONVERTED
                        </span>
                      ) : (
                        <span style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", padding: "2px 8px", color: "#555", fontSize: "11px" }}>
                          PENDING
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#fff", whiteSpace: "nowrap" }}>
                      {lead.firstName ? `${lead.firstName} ${lead.lastName}` : "—"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#22C55E" }}>{lead.email ?? "—"}</td>
                    <td style={{ padding: "12px 16px", color: lead.phone ? "#FF4500" : "#333" }}>{lead.phone ?? "—"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", padding: "2px 8px", color: "#FFD700", fontSize: "11px" }}>
                        {lead.variant ?? "—"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#666", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.offer.title}</td>
                    <td style={{ padding: "12px 16px", color: "#FFD700", fontWeight: 700 }}>${lead.offer.payout.toFixed(2)}</td>
                    <td style={{ padding: "12px 16px", color: "#555" }}>{lead.utmSource ?? "—"}</td>
                    <td style={{ padding: "12px 16px", color: "#444", whiteSpace: "nowrap" }}>
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