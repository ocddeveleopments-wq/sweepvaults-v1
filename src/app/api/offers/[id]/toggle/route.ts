import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const offer = await prisma.offer.findUnique({ where: { id } })
    if (!offer) return NextResponse.json({ success: false }, { status: 404 })
    const updated = await prisma.offer.update({
      where: { id },
      data: { active: !offer.active },
    })
    return NextResponse.json({ success: true, active: updated.active })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}