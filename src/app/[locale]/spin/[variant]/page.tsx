import { getActiveOffer } from "@/app/actions"
import SpinClient from "./SpinClient"

export default async function SpinPage({
  params,
}: {
  params: Promise<{ locale: string; variant: string }>
}) {
  const { locale, variant } = await params
  const offer = await getActiveOffer(locale)

  if (!offer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-2">No active offers</h1>
          <p className="text-gray-400">Check back soon!</p>
        </div>
      </div>
    )
  }

  return <SpinClient offer={offer} locale={locale} variant={variant} />
}