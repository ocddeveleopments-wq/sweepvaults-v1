"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
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

const VARIANT_THEMES = {
  v1: {
    bg: "linear-gradient(135deg, #0a0800 0%, #1a1400 50%, #0a0800 100%)",
    accent: "#FFD700",
    accentDim: "#CFB53B",
    cardBg: "#111008",
    cardBorder: "#FFD70040",
    title: "Win $25,000 Cash",
    subtitle: "Spin the wheel — everyone's a winner",
    winTitle: "YOU WON!",
    winColor: "#FFD700",
  },
  v2: {
    bg: "linear-gradient(135deg, #0a0300 0%, #1a0800 50%, #0a0300 100%)",
    accent: "#FF4500",
    accentDim: "#FF6B35",
    cardBg: "#110500",
    cardBorder: "#FF450040",
    title: "Win $25,000 Cash",
    subtitle: "Your prize is one spin away",
    winTitle: "ON FIRE!",
    winColor: "#FF4500",
  },
  v3: {
    bg: "linear-gradient(135deg, #020010 0%, #0D0D2B 50%, #020010 100%)",
    accent: "#00FFFF",
    accentDim: "#FF00FF",
    cardBg: "#0D0D2B",
    cardBorder: "#00FFFF40",
    title: "Win $25,000 Cash",
    subtitle: "Spin to unlock your prize",
    winTitle: "JACKPOT!",
    winColor: "#00FFFF",
  },
  v4: {
    bg: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)",
    accent: "#22C55E",
    accentDim: "#16A34A",
    cardBg: "#ffffff",
    cardBorder: "#22C55E40",
    title: "Win $25,000 Cash",
    subtitle: "Free entry — no purchase necessary",
    winTitle: "WINNER!",
    winColor: "#22C55E",
  },
  v5: {
    bg: "linear-gradient(135deg, #0a0000 0%, #1a0000 50%, #0a0000 100%)",
    accent: "#FF0000",
    accentDim: "#FFD700",
    cardBg: "#110000",
    cardBorder: "#FF000040",
    title: "Win $25,000 Cash",
    subtitle: "The biggest prize of the year",
    winTitle: "MEGA WIN!",
    winColor: "#FF0000",
  },
}

function fireWinAnimation(variant: string, accent: string) {
  if (variant === "v1") {
    // Gold coins raining
    const end = Date.now() + 2000
    const colors = ["#FFD700", "#CFB53B", "#FFF8DC"]
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
        shapes: ["circle"],
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
        shapes: ["circle"],
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  } else if (variant === "v2") {
    // Explosive confetti burst
    confetti({
      particleCount: 200,
      spread: 160,
      origin: { y: 0.6 },
      colors: ["#FF4500", "#FF6B35", "#FFD700", "#fff"],
      startVelocity: 60,
    })
  } else if (variant === "v3") {
    // Neon multi-burst
    ;[0.25, 0.5, 0.75].forEach((x) => {
      confetti({
        particleCount: 80,
        spread: 120,
        origin: { x, y: 0.5 },
        colors: ["#00FFFF", "#FF00FF", "#00FF88", "#FFD700"],
        shapes: ["star"],
        startVelocity: 45,
      })
    })
  } else if (variant === "v4") {
    // Clean green burst
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ["#22C55E", "#16A34A", "#fff", "#BBF7D0"],
    })
  } else {
    // v5 — nuclear everything
    confetti({
      particleCount: 300,
      spread: 180,
      origin: { y: 0.5 },
      colors: ["#FF0000", "#FFD700", "#fff", "#FF6B35", "#00FFFF"],
      shapes: ["star", "circle"],
      startVelocity: 80,
    })
    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 160,
        origin: { x: 0.1, y: 0.6 },
        colors: ["#FF0000", "#FFD700"],
      })
      confetti({
        particleCount: 200,
        spread: 160,
        origin: { x: 0.9, y: 0.6 },
        colors: ["#FF0000", "#FFD700"],
      })
    }, 500)
  }
}

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
  const [spinning, setSpinning] = useState(false)
  const [hasSpun, setHasSpun] = useState(false)
  const [shake, setShake] = useState(false)
  const theme = VARIANT_THEMES[variant as keyof typeof VARIANT_THEMES] ?? VARIANT_THEMES.v1

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

  function handleSpin() {
    setSpinning(true)
    capture("spin_clicked", { offerId: offer.id, variant })
  }

  async function handleWin() {
    setSpinning(false)
    setHasSpun(true)

    // Screen shake for v3 + v5
    if (variant === "v3" || variant === "v5") {
      setShake(true)
      setTimeout(() => setShake(false), 600)
    }

    fireWinAnimation(variant, theme.accent)
    capture("win_reveal_shown", { offerId: offer.id, variant })
    setStep("win")
    setTimeout(() => setStep("email"), 2500)
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
    } as any)

    if (result.success && result.leadId) {
      capture("email_submitted", { offerId: offer.id, variant, locale })

      if (offer.affiliatePostUrl && process.env.NODE_ENV === "production") {
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

  const isLight = variant === "v4"
  const textPrimary = isLight ? "#111" : "#fff"
  const textSecondary = isLight ? "#555" : "#aaa"

  return (
    <motion.div
      animate={shake ? { x: [-8, 8, -8, 8, -4, 4, 0] } : {}}
      transition={{ duration: 0.5 }}
      style={{
        minHeight: "100vh",
        background: theme.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>

        {/* Urgency bar */}
        <div
          style={{
            background: theme.accent,
            color: isLight ? "#000" : "#000",
            textAlign: "center",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "0.08em",
            marginBottom: "16px",
          }}
        >
          ⚡ LIMITED — ONLY 47 SPOTS REMAINING TODAY
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "12px" }}>
          <div style={{ fontSize: "28px", fontWeight: 900, color: theme.accent, letterSpacing: "-0.02em" }}>
            SweepVaults
          </div>
          <div style={{ fontSize: "13px", color: textSecondary, marginTop: "2px" }}>
            {theme.subtitle}
          </div>
        </div>

        {/* Social proof */}
        <div
          style={{
            background: `${theme.cardBg}`,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: "8px",
            padding: "8px 16px",
            textAlign: "center",
            fontSize: "12px",
            color: textSecondary,
            marginBottom: "16px",
          }}
        >
          <span style={{ color: theme.accent, fontWeight: 700 }}>2,847 people</span> entered today
        </div>

        <AnimatePresence mode="wait">

          {step === "spin" && (
            <motion.div
              key="spin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ textAlign: "center" }}
            >
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 900,
                  color: textPrimary,
                  marginBottom: "20px",
                  letterSpacing: "-0.02em",
                }}
              >
                {theme.title}
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Wheel
                  onWin={handleWin}
                  variant={variant}
                  spinning={spinning}
                  hasSpun={hasSpun}
                  onSpin={handleSpin}
                />
              </div>
              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  justifyContent: "center",
                  gap: "20px",
                }}
              >
                {["No purchase needed", "US residents", "18+"].map((t) => (
                  <div key={t} style={{ fontSize: "11px", color: textSecondary }}>
                    ✓ {t}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === "win" && (
            <motion.div
              key="win"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: "center", padding: "40px 0" }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{ fontSize: "72px", marginBottom: "16px" }}
              >
                🏆
              </motion.div>
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: 900,
                  color: theme.winColor,
                  letterSpacing: "-0.03em",
                }}
              >
                {theme.winTitle}
              </div>
              <div style={{ fontSize: "18px", color: textPrimary, marginTop: "8px" }}>
                Claim your prize now
              </div>
            </motion.div>
          )}

          {step === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                background: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: "20px",
                padding: "32px 24px",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div style={{ fontSize: "40px", marginBottom: "8px" }}>🎁</div>
                <div style={{ fontSize: "22px", fontWeight: 800, color: textPrimary }}>
                  Claim Your Prize!
                </div>
                <div style={{ fontSize: "14px", color: textSecondary, marginTop: "6px" }}>
                  Enter your email to receive your winnings
                </div>
              </div>
              <form onSubmit={handleEmailSubmit}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    border: `1.5px solid ${theme.accent}`,
                    background: "transparent",
                    color: textPrimary,
                    fontSize: "16px",
                    marginBottom: "12px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "16px",
                    background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDim})`,
                    color: isLight ? "#fff" : "#000",
                    fontWeight: 800,
                    fontSize: "16px",
                    border: "none",
                    borderRadius: "12px",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    letterSpacing: "0.04em",
                  }}
                >
                  {loading ? "Processing..." : "CLAIM MY PRIZE →"}
                </button>
              </form>
              <div style={{ fontSize: "11px", color: textSecondary, textAlign: "center", marginTop: "12px" }}>
                By entering you agree to our terms. No spam ever.
              </div>
            </motion.div>
          )}

          {step === "phone" && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                background: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: "20px",
                padding: "32px 24px",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div style={{ fontSize: "40px", marginBottom: "8px" }}>📱</div>
                <div style={{ fontSize: "22px", fontWeight: 800, color: textPrimary }}>
                  Double Your Chances!
                </div>
                <div
                  style={{
                    display: "inline-block",
                    background: theme.accent,
                    color: "#000",
                    fontWeight: 800,
                    fontSize: "12px",
                    padding: "4px 14px",
                    borderRadius: "20px",
                    marginTop: "8px",
                    letterSpacing: "0.06em",
                  }}
                >
                  2× MORE ENTRIES
                </div>
                <div style={{ fontSize: "14px", color: textSecondary, marginTop: "10px" }}>
                  Add your phone number for twice the chances to win
                </div>
              </div>
              <form onSubmit={handlePhoneSubmit}>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    border: `1.5px solid ${theme.accent}`,
                    background: "transparent",
                    color: textPrimary,
                    fontSize: "16px",
                    marginBottom: "12px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "16px",
                    background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDim})`,
                    color: "#000",
                    fontWeight: 800,
                    fontSize: "16px",
                    border: "none",
                    borderRadius: "12px",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    letterSpacing: "0.04em",
                  }}
                >
                  {loading ? "Processing..." : "2× MY ENTRIES →"}
                </button>
              </form>
              <button
                onClick={() => setStep("done")}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  color: textSecondary,
                  fontSize: "13px",
                  marginTop: "12px",
                  cursor: "pointer",
                  padding: "8px",
                }}
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
              style={{ textAlign: "center", padding: "40px 0" }}
            >
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>✅</div>
              <div style={{ fontSize: "28px", fontWeight: 900, color: textPrimary }}>
                You&apos;re entered!
              </div>
              <div style={{ fontSize: "15px", color: textSecondary, marginTop: "8px" }}>
                We&apos;ll contact you if you win. Good luck!
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  )
}