"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function EditOfferClient({ offer }: { offer: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: offer.title,
    network: offer.network,
    payout: offer.payout.toString(),
    affiliatePostUrl: offer.affiliatePostUrl,
    subParam: offer.subParam ?? "",
    countries: offer.countries.join(", "),
    languages: offer.languages.join(", "),
    prizeTheme: offer.prizeTheme ?? "",
    exitIntentEnabled: offer.exitIntentEnabled,
    exitIntentMaxShows: offer.exitIntentMaxShows,
    exitIntentCooldownHours: offer.exitIntentCooldownHours,
    exitIntentSkipReturners: offer.exitIntentSkipReturners,
  })

  function update(key: string, value: any) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/offers/${offer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        payout: parseFloat(form.payout),
        countries: form.countries.split(",").map((s: string) => s.trim().toUpperCase()),
        languages: form.languages.split(",").map((s: string) => s.trim().toLowerCase()),
      }),
    })
    if (res.ok) {
      router.push("/admin/offers")
    } else {
      alert("Error saving offer")
      setLoading(false)
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    background: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box" as const,
  }

  const labelStyle = {
    fontSize: "12px",
    color: "#888",
    marginBottom: "6px",
    display: "block",
    letterSpacing: "0.06em",
  }

  const sectionStyle = {
    background: "#111",
    border: "1px solid #222",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "16px",
  }

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

      <div style={{ padding: "32px", maxWidth: "640px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <Link href="/admin/offers" style={{ color: "#666", textDecoration: "none", fontSize: "14px" }}>← Back</Link>
          <div style={{ fontSize: "22px", fontWeight: 800 }}>Edit Offer</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={sectionStyle}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#FFD700", marginBottom: "20px", letterSpacing: "0.08em" }}>OFFER DETAILS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>TITLE</label>
                <input style={inputStyle} value={form.title} onChange={(e) => update("title", e.target.value)} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>NETWORK</label>
                  <input style={inputStyle} value={form.network} onChange={(e) => update("network", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>PAYOUT ($)</label>
                  <input style={inputStyle} type="number" step="0.01" value={form.payout} onChange={(e) => update("payout", e.target.value)} required />
                </div>
              </div>
              <div>
                <label style={labelStyle}>AFFILIATE TRACKING URL</label>
                <input style={inputStyle} value={form.affiliatePostUrl} onChange={(e) => update("affiliatePostUrl", e.target.value)} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>SUB PARAM</label>
                  <input style={inputStyle} value={form.subParam} onChange={(e) => update("subParam", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>COUNTRIES</label>
                  <input style={inputStyle} value={form.countries} onChange={(e) => update("countries", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>LANGUAGES</label>
                  <input style={inputStyle} value={form.languages} onChange={(e) => update("languages", e.target.value)} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>PRIZE THEME</label>
                <input style={inputStyle} value={form.prizeTheme} onChange={(e) => update("prizeTheme", e.target.value)} />
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#FFD700", marginBottom: "20px", letterSpacing: "0.08em" }}>EXIT INTENT SETTINGS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "14px", color: "#fff" }}>Enable exit intent</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>Show popup when visitor tries to leave</div>
                </div>
                <div onClick={() => update("exitIntentEnabled", !form.exitIntentEnabled)} style={{ width: "44px", height: "24px", borderRadius: "12px", background: form.exitIntentEnabled ? "#22C55E" : "#333", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                  <div style={{ position: "absolute", top: "3px", left: form.exitIntentEnabled ? "23px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>MAX SHOWS</label>
                  <input style={inputStyle} type="number" value={form.exitIntentMaxShows} onChange={(e) => update("exitIntentMaxShows", parseInt(e.target.value))} min={1} />
                </div>
                <div>
                  <label style={labelStyle}>COOLDOWN (hours)</label>
                  <input style={inputStyle} type="number" value={form.exitIntentCooldownHours} onChange={(e) => update("exitIntentCooldownHours", parseInt(e.target.value))} min={1} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "14px", color: "#fff" }}>Skip returners</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>Don&apos;t show exit popup to returning visitors</div>
                </div>
                <div onClick={() => update("exitIntentSkipReturners", !form.exitIntentSkipReturners)} style={{ width: "44px", height: "24px", borderRadius: "12px", background: form.exitIntentSkipReturners ? "#22C55E" : "#333", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                  <div style={{ position: "absolute", top: "3px", left: form.exitIntentSkipReturners ? "23px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "16px", background: loading ? "#555" : "#FFD700", color: "#000", fontWeight: 800, fontSize: "15px", border: "none", borderRadius: "12px", cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.04em" }}
          >
            {loading ? "Saving..." : "SAVE CHANGES"}
          </button>
        </form>
      </div>
    </div>
  )
}