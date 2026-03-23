import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const offers = await prisma.offer.findMany({
    where: { active: true },
    orderBy: { payout: "desc" },
  })

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "system-ui" }}>
      <div style={{ borderBottom: "1px solid #222", padding: "20px 32px", textAlign: "center" }}>
        <div style={{ fontSize: "32px", fontWeight: 900, color: "#FFD700", letterSpacing: "-0.02em" }}>SweepVaults</div>
        <div style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>Free sweepstakes — real prizes — no purchase necessary</div>
      </div>

      <div style={{ padding: "40px 32px", maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "13px", color: "#666", letterSpacing: "0.1em", marginBottom: "8px" }}>ACTIVE SWEEPSTAKES</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#fff" }}>Pick your prize and spin to win</div>
        </div>

        {offers.length === 0 ? (
          <div style={{ textAlign: "center", color: "#444", padding: "60px 0" }}>No active sweepstakes right now. Check back soon!</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {offers.map((offer: any) => (
              <Link key={offer.id} href={`/${locale}/spin/v1`} style={{ textDecoration: "none" }}>
                <div style={{ background: "#111", border: "1px solid #222", borderRadius: "16px", padding: "24px 28px", display: "flex", alignItems: "center", gap: "20px", cursor: "pointer" }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "12px", background: "#1a1600", border: "1px solid #FFD70040", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", flexShrink: 0 }}>🏆</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "17px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>{offer.title}</div>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "12px", color: "#666" }}>{offer.network}</span>
                      <span style={{ fontSize: "12px", color: "#666" }}>{offer.countries.join(", ")}</span>
                      <span style={{ fontSize: "11px", padding: "2px 8px", background: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", color: "#888" }}>Free entry</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: "22px", fontWeight: 900, color: "#FFD700" }}>SPIN</div>
                    <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>to win</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "48px", display: "flex", justifyContent: "center", gap: "32px", flexWrap: "wrap" }}>
          {["No purchase necessary", "US residents 18+", "Free to enter"].map((t) => (
            <div key={t} style={{ fontSize: "12px", color: "#444", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "#FFD700" }}>✓</span> {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}