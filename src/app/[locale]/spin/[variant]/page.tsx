import SpinClient from "./SpinClient"
import "../spin.css"
import { get } from "@vercel/edge-config"

export const dynamic = "force-static"
export const revalidate = 3600

export function generateStaticParams() {
  return [
    { locale: "en", variant: "v1" },
    { locale: "en", variant: "v2" },
    { locale: "en", variant: "v3" },
    { locale: "en", variant: "v4" },
    { locale: "en", variant: "v5" },
    { locale: "fr", variant: "v1" },
    { locale: "fr", variant: "v2" },
    { locale: "fr", variant: "v3" },
    { locale: "fr", variant: "v4" },
    { locale: "fr", variant: "v5" },
  ]
}

export default async function SpinPage({
  params,
}: {
  params: Promise<{ locale: string; variant: string }>
}) {
  const { locale, variant } = await params

  let offer: any = null
  try {
    offer = await get("active_offer")
  } catch {}

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