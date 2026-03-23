"use server"

import { prisma } from "@/lib/prisma"

export async function saveLead(data: {
  offerId: string
  email?: string
  phone?: string
  subId?: string
  locale: string
  variant: string
  ip?: string
  country?: string
  sessionId?: string
  visitorId?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}) {
  try {
    const lead = await prisma.lead.create({
      data: {
        offerId: data.offerId,
        email: data.email,
        phone: data.phone,
        subId: data.subId,
        locale: data.locale,
        variant: data.variant,
        ip: data.ip,
        country: data.country,
        utmSource: data.utm_source,
        utmMedium: data.utm_medium,
        utmCampaign: data.utm_campaign,
      },
    })
    return { success: true, leadId: lead.id }
  } catch (error) {
    console.error("saveLead error:", error)
    return { success: false }
  }
}

export async function getActiveOffer(locale: string) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get all active offers for this locale sorted by rotation order
    const offers = await prisma.offer.findMany({
      where: {
        active: true,
        languages: { has: locale },
      },
      orderBy: { rotationOrder: "asc" },
    })

    if (offers.length === 0) return null

    // Find first offer that hasn't hit its daily cap
    for (const offer of offers) {
      const todayLeads = await prisma.lead.count({
        where: {
          offerId: offer.id,
          createdAt: { gte: today },
        },
      })

      if (todayLeads < offer.dailyCap) {
        return { ...offer, todayLeads, remainingToday: offer.dailyCap - todayLeads }
      }
    }

    // All offers at cap — return last offer anyway so page still loads
    const lastOffer = offers[offers.length - 1]
    const todayLeads = await prisma.lead.count({
      where: { offerId: lastOffer.id, createdAt: { gte: today } },
    })
    return { ...lastOffer, todayLeads, remainingToday: 0 }

  } catch (error) {
    console.error("getActiveOffer error:", error)
    return null
  }
}

export async function trackEvent(data: {
  event: string
  offerId: string
  locale: string
  variant?: string
  subId?: string
  depth?: number
  sessionId?: string
  visitorId?: string
}) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        event: data.event,
        offerId: data.offerId,
        locale: data.locale,
        variant: data.variant,
        subId: data.subId,
        depth: data.depth,
        sessionId: data.sessionId,
        visitorId: data.visitorId,
      },
    })
  } catch (error) {
    console.error("trackEvent error:", error)
  }
}