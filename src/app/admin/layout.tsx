import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0a", fontFamily: "system-ui" }}>
      <div style={{ width: "220px", flexShrink: 0, background: "#0d0d0d", borderRight: "1px solid #1a1a1a", display: "flex", flexDirection: "column", padding: "24px 0" }}>
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid #1a1a1a", marginBottom: "16px" }}>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#FFD700", letterSpacing: "-0.02em" }}>SweepVaults</div>
          <div style={{ fontSize: "10px", color: "#444", letterSpacing: "0.1em", marginTop: "2px" }}>ADMIN PANEL</div>
        </div>
        <nav style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
          <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", textDecoration: "none", color: "#666", fontSize: "13px", fontWeight: 500 }}>
            <span>▦</span> Dashboard
          </Link>
          <Link href="/admin/offers" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", textDecoration: "none", color: "#666", fontSize: "13px", fontWeight: 500 }}>
            <span>◈</span> Offers
          </Link>
          <Link href="/admin/leads" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", textDecoration: "none", color: "#666", fontSize: "13px", fontWeight: 500 }}>
            <span>◉</span> Leads
          </Link>
          <Link href="/admin/analytics" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", textDecoration: "none", color: "#666", fontSize: "13px", fontWeight: 500 }}>
            <span>▲</span> Analytics
          </Link>
        </nav>
        <div style={{ padding: "16px 12px 0", borderTop: "1px solid #1a1a1a", display: "flex", flexDirection: "column", gap: "4px" }}>
          <a href="/en/spin/v1" target="_blank" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "8px", textDecoration: "none", color: "#444", fontSize: "12px" }}>→ Preview v1</a>
          <a href="/en/spin/v2" target="_blank" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "8px", textDecoration: "none", color: "#444", fontSize: "12px" }}>→ Preview v2</a>
          <a href="/en/spin/v3" target="_blank" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "8px", textDecoration: "none", color: "#444", fontSize: "12px" }}>→ Preview v3</a>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto" }}>
        {children}
      </div>
    </div>
  )
}