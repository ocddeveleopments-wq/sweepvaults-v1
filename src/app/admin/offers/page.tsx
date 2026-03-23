"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function OffersPage() {
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchOffers() {
    const res = await fetch("/api/offers")
    const data = await res.json()
    setOffers(data.offers ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchOffers() }, [])

  async function toggleOffer(id: string) {
    await fetch(`/api/offers/${id}/toggle`, { method: "POST" })
    fetchOffers()
  }

  async function deleteOffer(id: string) {
    if (!confirm("Delete this offer and all its leads? This cannot be undone.")) return
    await fetch(`/api/offers/${id}`, { method: "DELETE" })
    fetchOffers()
  }

  return (
    <div style={{ color: "#fff", minHeight: "100vh" }}>
      <div style={{ padding: "20px 32px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "20px", fontWeight: 800 }}>Offers</div>
          <div style={{ fontSize: "12px", color: "#444", marginTop: "2px" }}>Manage your MaxBounty offers</div>
        </div>
        <Link href="/admin/offers/new" style={{ background: "#FFD700", color: "#000", padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>
          + Add Offer
        </Link>
      </div>

      <div style={{ padding: "28px 32px" }}>
        {loading ? (
          <div style={{ color: "#444", fontSize: "14px" }}>Loading offers...</div>
        ) : offers.length === 0 ? (
          <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "40px", textAlign: "center", color: "#444" }}>
            No offers yet. Add your first offer to get started.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {offers.map((offer: any) => (
              <div key={offer.id} style={{ background: "#111", border: `1px solid ${offer.active ? "#FFD70030" : "#1a1a1a"}`, borderRadius: "12px", padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: offer.active ? "#22C55E" : "#444", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{offer.title}</div>
                    <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#555", flexWrap: "wrap" }}>
                      <span>{offer.network}</span>
                      <span>Countries: {offer.countries.join(", ")}</span>
                      <span>Languages: {offer.languages.join(", ")}</span>
                      <span>Leads: {offer._count?.leads ?? 0}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: 900, color: "#FFD700", flexShrink: 0 }}>
                    ${offer.payout.toFixed(2)}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #1a1a1a", flexWrap: "wrap" }}>
                  <a href={`/en/spin/v1`} target="_blank" style={{ padding: "7px 14px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "6px", color: "#666", fontSize: "12px", textDecoration: "none" }}>
                    Preview
                  </a>
                  <Link href={`/admin/offers/${offer.id}/edit`} style={{ padding: "7px 14px", background: "#1a1400", border: "1px solid #FFD70030", borderRadius: "6px", color: "#FFD700", fontSize: "12px", textDecoration: "none" }}>
                    Edit
                  </Link>
                  <button onClick={() => toggleOffer(offer.id)} style={{ padding: "7px 14px", background: offer.active ? "#1a0000" : "#001a00", border: `1px solid ${offer.active ? "#FF450030" : "#22C55E30"}`, borderRadius: "6px", color: offer.active ? "#FF4500" : "#22C55E", fontSize: "12px", cursor: "pointer" }}>
                    {offer.active ? "Pause" : "Activate"}
                  </button>
                  <button onClick={() => deleteOffer(offer.id)} style={{ padding: "7px 14px", background: "#1a0000", border: "1px solid #ff000020", borderRadius: "6px", color: "#ff4444", fontSize: "12px", cursor: "pointer", marginLeft: "auto" }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}