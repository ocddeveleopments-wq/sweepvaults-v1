import { prisma } from "@/lib/prisma"
import Link from "next/link"
import AdminDashboardClient from "./AdminDashboardClient"

export const dynamic = "force-dynamic"

async function getStats() {
  const [
    totalLeads,
    emailLeads,
    phoneLeads,
    activeOffers,
    totalOffers,
    recentLeads,
    leadsByVariant,
    leadsByDay,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { email: { not: null } } }),
    prisma.lead.count({ where: { phone: { not: null } } }),
    prisma.offer.count({ where: { active: true } }),
    prisma.offer.count(),
    prisma.lead.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { offer: { select: { title: true, payout: true } } },
    }),
    prisma.lead.groupBy({
      by: ["variant"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.lead.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      orderBy: { createdAt: "asc" },
      take: 30,
    }),
  ])

  const revenue = emailLeads * 2.0
  const phoneRevenue = phoneLeads * 0.5
  const phoneConvRate = emailLeads > 0 ? Math.round((phoneLeads / emailLeads) * 100) : 0
  const emailConvRate = totalLeads > 0 ? Math.round((emailLeads / (totalLeads || 1)) * 100) : 0

  return {
    totalLeads,
    emailLeads,
    phoneLeads,
    activeOffers,
    totalOffers,
    recentLeads,
    leadsByVariant,
    revenue: revenue + phoneRevenue,
    phoneConvRate,
    emailConvRate,
  }
}

export default async function AdminPage() {
  const stats = await getStats()
  return <AdminDashboardClient stats={stats} />
}