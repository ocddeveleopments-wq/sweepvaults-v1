import { getActiveOffer } from "@/app/actions"
import SpinClient from "./SpinClient"
import "../spin.css"

export default async function SpinPage({
  params,
}: {
  params: Promise<{ locale: string; variant: string }>
}) {
  const { locale, variant } = await params
  const offer = await getActiveOffer(locale)

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