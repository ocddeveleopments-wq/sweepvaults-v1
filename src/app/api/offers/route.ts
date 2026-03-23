import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { leads: true } } },
    })
    return NextResponse.json({ success: true, offers })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const offer = await prisma.offer.create({
      data: {
        title: body.title,
        network: body.network ?? "MaxBounty",
        payout: body.payout,
        affiliatePostUrl: body.affiliatePostUrl,
        subParam: body.subParam ?? null,
        countries: body.countries,
        languages: body.languages,
        prizeTheme: body.prizeTheme ?? null,
        exitIntentEnabled: body.exitIntentEnabled ?? true,
        exitIntentMaxShows: body.exitIntentMaxShows ?? 2,
        exitIntentCooldownHours: body.exitIntentCooldownHours ?? 24,
        exitIntentSkipReturners: body.exitIntentSkipReturners ?? true,
        active: true,
      },
    })
    return NextResponse.json({ success: true, offer })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}