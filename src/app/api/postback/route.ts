import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const subId   = searchParams.get("subid")
    const payout  = searchParams.get("payout")
    const offerId = searchParams.get("offer_id")

    if (!subId) {
      return NextResponse.json({ success: false, error: "Missing subid" }, { status: 400 })
    }

    const lead = await prisma.lead.findFirst({ where: { id: subId } })

    if (!lead) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 })
    }

    if (lead.converted) {
      return NextResponse.json({ success: true, message: "Already converted" })
    }

    await prisma.lead.update({
      where: { id: subId },
      data: { converted: true, convertedAt: new Date() },
    })

    console.log(`✅ Conversion recorded — Lead: ${subId} Payout: ${payout} Offer: ${offerId}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Postback error:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}