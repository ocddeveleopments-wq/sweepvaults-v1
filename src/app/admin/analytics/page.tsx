export const dynamic = "force-dynamic"

export default function AnalyticsPage() {
  return (
    <div style={{ color: "#fff", minHeight: "100vh" }}>
      <div style={{ padding: "20px 32px", borderBottom: "1px solid #1a1a1a" }}>
        <div style={{ fontSize: "20px", fontWeight: 800 }}>Analytics</div>
        <div style={{ fontSize: "12px", color: "#444", marginTop: "2px" }}>PostHog handles deep analytics — link below</div>
      </div>
      <div style={{ padding: "32px" }}>
        <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "32px", textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>📊</div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>Full Analytics in PostHog</div>
          <div style={{ fontSize: "14px", color: "#666", marginBottom: "24px" }}>Funnels, session replays, heatmaps, and experiments are all in your PostHog dashboard.</div>
          <a href="https://app.posthog.com" target="_blank" style={{ background: "#FFD700", color: "#000", padding: "12px 24px", borderRadius: "8px", fontSize: "14px", fontWeight: 700, textDecoration: "none" }}>
            Open PostHog Dashboard →
          </a>
        </div>
      </div>
    </div>
  )
}