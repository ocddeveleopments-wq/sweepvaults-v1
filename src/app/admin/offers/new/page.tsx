"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NewOfferPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: "",
    network: "MaxBounty",
    payout: "",
    affiliatePostUrl: "",
    subParam: "s2",
    countries: "US",
    languages: "en",
    prizeTheme: "",
    dailyCap: 15,
    rotationOrder: 0,
    exitIntentEnabled: true,
    exitIntentMaxShows: 2,
    exitIntentCooldownHours: 24,
    exitIntentSkipReturners: true,
  })

  function update(key: string, value: any) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        payout: parseFloat(form.payout),
        countries: form.countries.split(",").map((s) => s.trim().toUpperCase()),
        languages: form.languages.split(",").map((s) => s.trim().toLowerCase()),
        dailyCap: form.dailyCap,
        rotationOrder: form.rotationOrder,
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
    <div style={{ color: "#fff", minHeight: "100vh" }}>
      <div style={{ padding: "20px 32px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: "16px" }}>
        <Link href="/admin/offers" style={{ color: "#555", textDecoration: "none", fontSize: "14px" }}>← Back</Link>
        <div style={{ fontSize: "20px", fontWeight: 800 }}>New Offer</div>
      </div>

      <div style={{ padding: "28px 32px", maxWidth: "640px" }}>
        <form onSubmit={handleSubmit}>

          {/* Offer details */}
          <div style={sectionStyle}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#FFD700", marginBottom: "20px", letterSpacing: "0.08em" }}>OFFER DETAILS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>TITLE</label>
                <input style={inputStyle} value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Win Big Sweepstakes – $25,000 Cash" required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>NETWORK</label>
                  <input style={inputStyle} value={form.network} onChange={(e) => update("network", e.target.value)} placeholder="MaxBounty" />
                </div>
                <div>
                  <label style={labelStyle}>PAYOUT ($)</label>
                  <input style={inputStyle} type="number" step="0.01" value={form.payout} onChange={(e) => update("payout", e.target.value)} placeholder="2.00" required />
                </div>
              </div>
              <div>
                <label style={labelStyle}>AFFILIATE TRACKING URL</label>
                <input style={inputStyle} value={form.affiliatePostUrl} onChange={(e) => update("affiliatePostUrl", e.target.value)} placeholder="https://afflat3c1.com/trk/lnk/..." required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>SUB PARAM</label>
                  <input style={inputStyle} value={form.subParam} onChange={(e) => update("subParam", e.target.value)} placeholder="s2" />
                </div>
                <div>
                  <label style={labelStyle}>COUNTRIES</label>
                  <input style={inputStyle} value={form.countries} onChange={(e) => update("countries", e.target.value)} placeholder="US, CA" />
                </div>
                <div>
                  <label style={labelStyle}>LANGUAGES</label>
                  <input style={inputStyle} value={form.languages} onChange={(e) => update("languages", e.target.value)} placeholder="en, fr" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>PRIZE THEME (optional)</label>
                <input style={inputStyle} value={form.prizeTheme} onChange={(e) => update("prizeTheme", e.target.value)} placeholder="cash, giftcard, vacation..." />
              </div>
            </div>
          </div>

          {/* Rotation settings */}
          <div style={sectionStyle}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#FFD700", marginBottom: "20px", letterSpacing: "0.08em" }}>ROTATION SETTINGS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={labelStyle}>DAILY CAP</label>
                <input style={inputStyle} type="number" value={form.dailyCap} onChange={(e) => update("dailyCap", parseInt(e.target.value))} min={1} />
                <div style={{ fontSize: "11px", color: "#555", marginTop: "4px" }}>Max leads per day for this offer</div>
              </div>
              <div>
                <label style={labelStyle}>ROTATION ORDER</label>
                <input style={inputStyle} type="number" value={form.rotationOrder} onChange={(e) => update("rotationOrder", parseInt(e.target.value))} min={0} />
                <div style={{ fontSize: "11px", color: "#555", marginTop: "4px" }}>Lower = higher priority (0 = first)</div>
              </div>
            </div>
          </div>

          {/* Exit intent */}
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
                  <label style={labelStyle}>MAX SHOWS PER VISITOR</label>
                  <input style={inputStyle} type="number" value={form.exitIntentMaxShows} onChange={(e) => update("exitIntentMaxShows", parseInt(e.target.value))} min={1} max={10} />
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
            {loading ? "Saving..." : "SAVE OFFER"}
          </button>
        </form>
      </div>
    </div>
  )
}