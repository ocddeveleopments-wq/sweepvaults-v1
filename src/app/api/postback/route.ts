import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// MaxBounty hits this URL when a lead converts
// Set your postback URL in MaxBounty to:
// https://www.sweepvaults.com/api/postback?subid={s2}&payout={payout}&offer_id={offer_id}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const subId = searchParams.get("subid")
    const payout = searchParams.get("payout")
    const offerId = searchParams.get("offer_id")

    if (!subId) {
      return NextResponse.json({ success: false, error: "Missing subid" }, { status: 400 })
    }

    // Find the lead by subId (which is the lead ID we passed as s2)
    const lead = await prisma.lead.findFirst({
      where: { id: subId },
    })

    if (!lead) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 })
    }

    if (lead.converted) {
      return NextResponse.json({ success: true, message: "Already converted" })
    }

    // Mark as converted
    await prisma.lead.update({
      where: { id: subId },
      data: {
        converted: true,
        convertedAt: new Date(),
      },
    })

    console.log(`✅ Conversion recorded — Lead: ${subId} Payout: ${payout} Offer: ${offerId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Postback error:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}