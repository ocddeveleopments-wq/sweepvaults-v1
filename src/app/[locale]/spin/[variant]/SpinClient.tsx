"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Wheel from "@/components/Wheel"
import { saveLead, trackEvent } from "@/app/actions"
import { getSessionId, getVisitorId, isReturner } from "@/lib/session"
import { initPostHog, capture } from "@/lib/posthog"

interface Offer {
  id: string
  title: string
  payout: number
  affiliatePostUrl: string
  subParam: string | null
  prizeTheme: string | null
  exitIntentEnabled: boolean
  exitIntentMaxShows: number
  exitIntentCooldownHours: number
  exitIntentSkipReturners: boolean
}

type Step = "spin" | "win" | "email" | "phone" | "done"

export default function SpinClient({
  offer,
  locale,
  variant,
}: {
  offer: Offer
  locale: string
  variant: string
}) {
  const [step, setStep] = useState<Step>("spin")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [leadId, setLeadId] = useState<string | null>(null)

  useEffect(() => {
    initPostHog()
    capture("page_view", {
      offerId: offer.id,
      locale,
      variant,
      sessionId: getSessionId(),
      visitorId: getVisitorId(),
      returner: isReturner(),
    })
    trackEvent({
      event: "page_view",
      offerId: offer.id,
      locale,
      variant,
      sessionId: getSessionId(),
      visitorId: getVisitorId(),
    })
  }, [])

  async function handleWin() {
    setStep("win")
    capture("win_reveal_shown", { offerId: offer.id, variant })
    setTimeout(() => setStep("email"), 2000)
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)

    const result = await saveLead({
      offerId: offer.id,
      email,
      locale,
      variant,
      sessionId: getSessionId(),
      visitorId: getVisitorId(),
    } as any)

    if (result.success && result.leadId) {
      setLeadId(result.leadId)
      capture("email_submitted", { offerId: offer.id, variant, locale })

      // Post to MaxBounty
      if (offer.affiliatePostUrl) {
        const url = new URL(offer.affiliatePostUrl)
        url.searchParams.set("email", email)
        if (offer.subParam) url.searchParams.set(offer.subParam, result.leadId)
        fetch(url.toString(), { mode: "no-cors" }).catch(() => {})
      }
    }

    setLoading(false)
    setStep("phone")
  }

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!phone) return
    setLoading(true)

    await saveLead({
      offerId: offer.id,
      email,
      phone,
      locale,
      variant,
    } as any)

    capture("phone_upsell_submitted", { offerId: offer.id, variant, locale })
    setLoading(false)
    setStep("done")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">

          {step === "spin" && (
            <motion.div
              key="spin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold text-white mb-2">
                {offer.title}
              </h1>
              <p className="text-gray-400 mb-8">
                Spin the wheel for your chance to win!
              </p>
              <div className="flex justify-center">
                <Wheel onWin={handleWin} variant={variant} />
              </div>
            </motion.div>
          )}

          {step === "win" && (
            <motion.div
              key="win"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-4xl font-bold text-yellow-400 mb-2">
                You Won!
              </h2>
              <p className="text-white text-xl">Claim your prize below</p>
            </motion.div>
          )}

          {step === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl p-8 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🏆</div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Claim Your Prize!
                </h2>
                <p className="text-gray-500 mt-1">
                  Enter your email to receive your winnings
                </p>
              </div>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-900"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-orange-400 to-orange-600 text-white font-bold rounded-xl text-lg disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Claim My Prize →"}
                </button>
              </form>
              <p className="text-xs text-gray-400 text-center mt-4">
                By entering, you agree to our terms. No spam ever.
              </p>
            </motion.div>
          )}

          {step === "phone" && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl p-8 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">📱</div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Double Your Entries!
                </h2>
                <p className="text-gray-500 mt-1">
                  Add your phone number for 2× more chances to win
                </p>
              </div>
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-900"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-orange-400 to-orange-600 text-white font-bold rounded-xl text-lg disabled:opacity-50"
                >
                  {loading ? "Processing..." : "2× My Entries →"}
                </button>
              </form>
              <button
                onClick={() => setStep("done")}
                className="w-full text-center text-gray-400 text-sm mt-3 hover:text-gray-600"
              >
                No thanks, skip
              </button>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-3xl font-bold text-white mb-2">
                You&apos;re entered!
              </h2>
              <p className="text-gray-400">
                We&apos;ll contact you if you win. Good luck!
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}