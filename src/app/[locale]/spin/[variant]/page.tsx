import SpinClient from "./SpinClient"
import "../spin.css"
import { Suspense } from "react"
import { get } from "@vercel/edge-config"
import { prisma } from "@/lib/prisma"

export const revalidate = 30

function SpinSkeleton() {
  return (
    <div style={{ minHeight: "100vh", background: "#080600", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "24px" }}>
      <div style={{ width: "280px", height: "280px", borderRadius: "50%", background: "#1a1200", border: "4px solid #2a2000" }} />
      <div style={{ width: "200px", height: "56px", borderRadius: "50px", background: "#1a1200" }} />
    </div>
  )
}

async function SpinPageContent({ locale, variant }: { locale: string; variant: string }) {
  let offer: any = null

  try {
    // Try Edge Config first — instant, no DB hit
    const cachedOffer = await get("active_offer")
    if (cachedOffer) {
      // Just check daily cap against DB
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayLeads = await prisma.lead.count({
        where: { offerId: (cachedOffer as any).id, createdAt: { gte: today } },
      })
      const cap = (cachedOffer as any).dailyCap ?? 15
      if (todayLeads < cap) {
        offer = { ...(cachedOffer as Record<string, any>), todayLeads, remainingToday: cap - todayLeads }

      }
    }
  } catch {}

  // Fallback to DB if Edge Config fails
  if (!offer) {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const offers = await prisma.offer.findMany({
        where: { active: true, languages: { has: locale } },
        orderBy: { rotationOrder: "asc" },
      })
      for (const o of offers) {
        const todayLeads = await prisma.lead.count({
          where: { offerId: o.id, createdAt: { gte: today } },
        })
        if (todayLeads < o.dailyCap) {
          offer = { ...o, todayLeads, remainingToday: o.dailyCap - todayLeads }
          break
        }
      }
      if (!offer && offers[0]) offer = { ...offers[0], todayLeads: 0, remainingToday: 0 }
    } catch {}
  }

  if (!offer) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a" }}>
        <div style={{ textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎰</div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>No active offers</h1>
          <p style={{ color: "#555" }}>Check back soon!</p>
        </div>
      </div>
    )
  }

  return <SpinClient offer={offer} locale={locale} variant={variant} />
}

export default async function SpinPage({
  params,
}: {
  params: Promise<{ locale: string; variant: string }>
}) {
  const { locale, variant } = await params
  return (
    <Suspense fallback={<SpinSkeleton />}>
      <SpinPageContent locale={locale} variant={variant} />
    </Suspense>
  )
}