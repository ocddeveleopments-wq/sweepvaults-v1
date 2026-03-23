import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function OffersPage() {
  const offers = await prisma.offer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { leads: true } } },
  })

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "system-ui" }}>
      <div style={{ borderBottom: "1px solid #222", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: "20px", fontWeight: 800, color: "#FFD700" }}>SweepVaults Admin</div>
        <div style={{ display: "flex", gap: "16px" }}>
          <Link href="/admin" style={{ color: "#888", textDecoration: "none", fontSize: "14px" }}>Dashboard</Link>
          <Link href="/admin/offers" style={{ color: "#FFD700", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>Offers</Link>
          <Link href="/admin/leads" style={{ color: "#888", textDecoration: "none", fontSize: "14px" }}>Leads</Link>
        </div>
      </div>
      <div style={{ padding: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "22px", fontWeight: 800 }}>Offers</div>
          <Link href="/admin/offers/new" style={{ background: "#FFD700", color: "#000", padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>
            + Add Offer
          </Link>
        </div>
        {offers.length === 0 ? (
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: "12px", padding: "40px", textAlign: "center", color: "#444" }}>
            No offers yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {offers.map((offer: any) => (
              <div key={offer.id} style={{ background: "#111", border: "1px solid #222", borderRadius: "12px", padding: "20px 24px", display: "flex", alignItems: "center", gap: "20px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: offer.active ? "#22C55E" : "#444", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{offer.title}</div>
                  <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#666" }}>
                    <span>{offer.network}</span>
                    <span>Countries: {offer.countries.join(", ")}</span>
                    <span>Leads: {offer._count.leads}</span>
                  </div>
                </div>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#FFD700" }}>${offer.payout.toFixed(2)}</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Link href="/en/spin/v1" target="_blank" style={{ padding: "6px 12px", background: "#1a1a1a", border: "1px solid #333", borderRadius: "6px", color: "#888", fontSize: "12px", textDecoration: "none" }}>
                    Preview
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}