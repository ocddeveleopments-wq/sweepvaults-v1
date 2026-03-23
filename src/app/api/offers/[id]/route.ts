import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await prisma.lead.deleteMany({ where: { offerId: id } })
    await prisma.analyticsEvent.deleteMany({ where: { offerId: id } })
    await prisma.offer.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await req.json()
    const updated = await prisma.offer.update({
      where: { id },
      data: {
        title: body.title,
        network: body.network,
        payout: body.payout,
        affiliatePostUrl: body.affiliatePostUrl,
        subParam: body.subParam ?? null,
        countries: body.countries,
        languages: body.languages,
        prizeTheme: body.prizeTheme ?? null,
        dailyCap: body.dailyCap ?? 15,
        rotationOrder: body.rotationOrder ?? 0,
        exitIntentEnabled: body.exitIntentEnabled,
        exitIntentMaxShows: body.exitIntentMaxShows,
        exitIntentCooldownHours: body.exitIntentCooldownHours,
        exitIntentSkipReturners: body.exitIntentSkipReturners,
      },
    })
    return NextResponse.json({ success: true, offer: updated })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}