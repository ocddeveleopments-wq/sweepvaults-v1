import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const forwarded = req.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") ?? null
    const country = req.headers.get("x-vercel-ip-country") ?? null

    const lead = await prisma.lead.create({
      data: {
        offerId:     body.offerId,
        email:       body.email,
        phone:       body.phone,
        firstName:   body.firstName,
        lastName:    body.lastName,
        subId:       body.subId,
        locale:      body.locale ?? "en",
        variant:     body.variant,
        ip,
        country,
        utmSource:   body.utm_source,
        utmMedium:   body.utm_medium,
        utmCampaign: body.utm_campaign,
      },
    })
    return NextResponse.json({ success: true, leadId: lead.id })
  } catch (error) {
    console.error("POST /api/leads error:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
