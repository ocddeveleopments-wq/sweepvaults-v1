import { getActiveOffer } from "@/app/actions"
import SpinClient from "./SpinClient"
import "../spin.css"
import { Suspense } from "react"

function SpinSkeleton() {
  return (
    <div style={{ minHeight: "100vh", background: "#080600", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "24px" }}>
      <div style={{ width: "300px", height: "300px", borderRadius: "50%", background: "#1a1200", border: "4px solid #2a2000", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ width: "200px", height: "56px", borderRadius: "50px", background: "#1a1200", animation: "pulse 1.5s ease-in-out infinite 0.2s" }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  )
}

async function SpinPageContent({ locale, variant }: { locale: string; variant: string }) {
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

export default async function SpinPage({
  params,
}: {
  params: Promise<{ locale: string; variant: string }>
}) {
  const { locale, variant } = await params

  return (
    <Suspense fallback={<SpinSkeleton />}>
      <SpinPageContent locale={locale} variant={variant} />
    </Suspense>
  )
}