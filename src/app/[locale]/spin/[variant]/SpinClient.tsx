"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import Wheel from "@/components/Wheel"
import ExitIntent from "@/components/ExitIntent"
import ScrollTracker from "@/components/ScrollTracker"
import WinnerTicker from "@/components/WinnerTicker"
import CountdownTimer from "@/components/CountdownTimer"
import RecentWinnersPopup from "@/components/RecentWinnersPopup"
import SecurityBadges from "@/components/SecurityBadges"
import ProgressBar from "@/components/ProgressBar"
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
    bg: "linear-gradient(160deg, #0a0800 0%, #1a1200 50%, #0a0800 100%)",
    accent: "#FFD700",
    accentDim: "#CFB53B",
    cardBg: "#111008",
    cardBorder: "#FFD70040",
    title: "Win $25,000 Cash",
    subtitle: "Spin the wheel — everyone's a winner",
    winTitle: "YOU WON!",
    winColor: "#FFD700",
    isLight: false,
    font: "'Oswald', sans-serif",
  },
  v2: {
    bg: "linear-gradient(160deg, #0a0000 0%, #1a0000 50%, #0a0000 100%)",
    accent: "#FF2222",
    accentDim: "#CC0000",
    cardBg: "#110000",
    cardBorder: "#FF222240",
    title: "Win $25,000 Cash",
    subtitle: "Your prize is one spin away",
    winTitle: "ON FIRE! 🔥",
    winColor: "#FF2222",
    isLight: false,
    font: "'Oswald', sans-serif",
  },
  v3: {
    bg: "linear-gradient(160deg, #0a0015 0%, #150025 50%, #0a0015 100%)",
    accent: "#A855F7",
    accentDim: "#7C3AED",
    cardBg: "#0d0020",
    cardBorder: "#A855F740",
    title: "Win $25,000 Cash",
    subtitle: "Spin to unlock your prize",
    winTitle: "JACKPOT! ⚡",
    winColor: "#A855F7",
    isLight: false,
    font: "'Oswald', sans-serif",
  },
  v4: {
    bg: "linear-gradient(160deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)",
    accent: "#059669",
    accentDim: "#047857",
    cardBg: "#ffffff",
    cardBorder: "#05966940",
    title: "Win $25,000 Cash",
    subtitle: "Free entry — no purchase necessary",
    winTitle: "WINNER! ✓",
    winColor: "#059669",
    isLight: true,
    font: "'Inter', sans-serif",
  },
  v5: {
    bg: "linear-gradient(160deg, #0a0000 0%, #1a0000 50%, #0a0000 100%)",
    accent: "#FF0000",
    accentDim: "#CC0000",
    cardBg: "#110000",
    cardBorder: "#FF000040",
    title: "Win $25,000 Cash",
    subtitle: "The biggest prize of the year",
    winTitle: "MEGA WIN! 💥",
    winColor: "#FF0000",
    isLight: false,
    font: "'Oswald', sans-serif",
  },
}

function fireWinAnimation(variant: string) {
  if (variant === "v1") {
    const end = Date.now() + 2500
    const colors = ["#FFD700", "#CFB53B", "#FFF8DC", "#FFE44D"]
    const frame = () => {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors, shapes: ["circle"] })
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors, shapes: ["circle"] })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  } else if (variant === "v2") {
    confetti({ particleCount: 250, spread: 180, origin: { y: 0.5 }, colors: ["#FF2222", "#FF6666", "#FFD700", "#fff"], startVelocity: 70 })
  } else if (variant === "v3") {
    ;[0.2, 0.5, 0.8].forEach((x) => {
      confetti({ particleCount: 100, spread: 130, origin: { x, y: 0.5 }, colors: ["#A855F7", "#EC4899", "#06B6D4", "#10B981", "#FFD700"], shapes: ["star"], startVelocity: 50 })
    })
  } else if (variant === "v4") {
    confetti({ particleCount: 180, spread: 100, origin: { y: 0.6 }, colors: ["#059669", "#10B981", "#fff", "#BBF7D0", "#34D399"] })
  } else {
    confetti({ particleCount: 400, spread: 200, origin: { y: 0.4 }, colors: ["#FF0000", "#FFD700", "#fff", "#FF6B35", "#FF4444"], shapes: ["star", "circle"], startVelocity: 90 })
    setTimeout(() => {
      confetti({ particleCount: 200, spread: 160, origin: { x: 0.1, y: 0.6 }, colors: ["#FF0000", "#FFD700"] })
      confetti({ particleCount: 200, spread: 160, origin: { x: 0.9, y: 0.6 }, colors: ["#FF0000", "#FFD700"] })
    }, 400)
    setTimeout(() => {
      confetti({ particleCount: 150, spread: 120, origin: { x: 0.5, y: 0.3 }, colors: ["#FFD700", "#fff"] })
    }, 800)
  }
}

function getUTMParams() {
  if (typeof window === "undefined") return {}
  const p = new URLSearchParams(window.location.search)
  return {
    utm_source: p.get("utm_source") ?? undefined,
    utm_medium: p.get("utm_medium") ?? undefined,
    utm_campaign: p.get("utm_campaign") ?? undefined,
  }
}

function playSound(type: "spin" | "win" | "click") {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    if (type === "click") {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
      osc.start()
      osc.stop(ctx.currentTime + 0.1)
    } else if (type === "win") {
      const notes = [523, 659, 784, 1047]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15)
        osc.type = "sine"
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.15)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.3)
        osc.start(ctx.currentTime + i * 0.15)
        osc.stop(ctx.currentTime + i * 0.15 + 0.3)
      })
    }
  } catch {}
}

export default function SpinClient({ offer, locale, variant }: { offer: Offer; locale: string; variant: string }) {
  const [step, setStep] = useState<Step>("spin")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [hasSpun, setHasSpun] = useState(false)
  const [shake, setShake] = useState(false)
  const [sessionId, setSessionId] = useState("")
  const [visitorId, setVisitorId] = useState("")
  const [spotsLeft, setSpotsLeft] = useState(0)
  const [enteredToday, setEnteredToday] = useState(0)
  const [viewersNow, setViewersNow] = useState(0)

  const theme = VARIANT_THEMES[variant as keyof typeof VARIANT_THEMES] ?? VARIANT_THEMES.v1
  const textPrimary = theme.isLight ? "#111" : "#fff"
  const textSecondary = theme.isLight ? "#555" : "#aaa"

  useEffect(() => {
    initPostHog()
    const sid = getSessionId()
    const vid = getVisitorId()
    setSessionId(sid)
    setVisitorId(vid)
    const utms = getUTMParams()
    capture("page_view", { offerId: offer.id, locale, variant, sessionId: sid, visitorId: vid, returner: isReturner(), ...utms })
    trackEvent({ event: "page_view", offerId: offer.id, locale, variant, sessionId: sid, visitorId: vid })

    // Dynamic social proof
    const baseSpots = Math.floor(Math.random() * 35) + 12
    setSpotsLeft(baseSpots)
    const hour = new Date().getHours()
    const baseEntered = 1200 + hour * 180 + Math.floor(Math.random() * 300)
    setEnteredToday(baseEntered)
    setViewersNow(Math.floor(Math.random() * 18) + 8)

    // Countdown spots
    const spotsInterval = setInterval(() => {
      setSpotsLeft((prev) => {
        if (prev <= 3) return prev
        return Math.random() > 0.6 ? prev - 1 : prev
      })
    }, Math.floor(Math.random() * 7000) + 8000)

    // Viewers fluctuation
    const viewersInterval = setInterval(() => {
      setViewersNow((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1
        return Math.max(5, Math.min(30, prev + delta))
      })
    }, 5000)

    return () => {
      clearInterval(spotsInterval)
      clearInterval(viewersInterval)
    }
  }, [])

  function handleSpin() {
    setSpinning(true)
    playSound("click")
    capture("spin_clicked", { offerId: offer.id, variant })
  }

  async function handleWin() {
    setSpinning(false)
    setHasSpun(true)
    if (variant === "v3" || variant === "v5") {
      setShake(true)
      setTimeout(() => setShake(false), 600)
    }
    fireWinAnimation(variant)
    playSound("win")
    capture("win_reveal_shown", { offerId: offer.id, variant })
    setStep("win")
    setTimeout(() => setStep("email"), 2800)
  }

  async function postToAffiliate(emailVal: string, leadId: string) {
    if (!offer.affiliatePostUrl || process.env.NODE_ENV !== "production") return
    try {
      const url = new URL(offer.affiliatePostUrl)
      url.searchParams.set("email", emailVal)
      if (offer.subParam) url.searchParams.set(offer.subParam, leadId)
      fetch(url.toString(), { mode: "no-cors" }).catch(() => {})
    } catch {}
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    playSound("click")
    const utms = getUTMParams()
    const result = await saveLead({ offerId: offer.id, email, locale, variant, sessionId, visitorId, ...utms } as any)
    if (result.success && result.leadId) {
      capture("email_submitted", { offerId: offer.id, variant, locale })
      await postToAffiliate(email, result.leadId)
    }
    setLoading(false)
    setStep("phone")
  }

  async function handleExitIntentSubmit(emailVal: string) {
    const result = await saveLead({ offerId: offer.id, email: emailVal, locale, variant: `${variant}_exit`, sessionId, visitorId } as any)
    if (result.success && result.leadId) {
      await postToAffiliate(emailVal, result.leadId)
    }
  }

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!phone) return
    setLoading(true)
    playSound("click")
    await saveLead({ offerId: offer.id, email, phone, locale, variant, sessionId, visitorId } as any)
    capture("phone_upsell_submitted", { offerId: offer.id, variant, locale })
    setLoading(false)
    setStep("done")
  }

  return (
    <>
      <ScrollTracker offerId={offer.id} variant={variant} locale={locale} sessionId={sessionId} visitorId={visitorId} />
      <RecentWinnersPopup accentColor={theme.accent} />

      {offer.exitIntentEnabled && step === "spin" && (
        <ExitIntent
          offerId={offer.id}
          variant={variant}
          maxShows={offer.exitIntentMaxShows}
          cooldownHours={offer.exitIntentCooldownHours}
          skipReturners={offer.exitIntentSkipReturners}
          onSubmit={handleExitIntentSubmit}
          accentColor={theme.accent}
          isLight={theme.isLight}
        />
      )}

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
          fontFamily: theme.font,
        }}
      >
        <div style={{ width: "100%", maxWidth: "440px" }}>

          {/* Progress bar */}
          <ProgressBar step={step} accentColor={theme.accent} />

          {/* Winner ticker */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <WinnerTicker accentColor={theme.accent} />
          </div>

          {/* Countdown */}
          <CountdownTimer accentColor={theme.accent} textColor={textSecondary} />

          {/* Urgency bar */}
          <motion.div
            animate={{ opacity: spotsLeft <= 10 ? [1, 0.7, 1] : 1 }}
            transition={{ repeat: spotsLeft <= 10 ? Infinity : 0, duration: 1.2 }}
            style={{
              background: spotsLeft <= 10 ? "#FF2222" : theme.accent,
              color: "#000",
              textAlign: "center",
              padding: "9px 16px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              marginBottom: "12px",
              fontFamily: theme.font,
            }}
          >
            ⚡ ONLY {spotsLeft || "?"} SPOTS REMAINING · {viewersNow} PEOPLE VIEWING NOW
          </motion.div>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "10px" }}>
            <div style={{
              fontSize: "32px",
              fontWeight: 700,
              color: theme.accent,
              letterSpacing: "0.02em",
              fontFamily: theme.font,
              textTransform: "uppercase",
              textShadow: `0 0 30px ${theme.accent}60`,
            }}>
              SweepVaults
            </div>
            <div style={{ fontSize: "13px", color: textSecondary, marginTop: "2px" }}>
              {theme.subtitle}
            </div>
          </div>

          {/* Social proof */}
          <div style={{
            background: theme.cardBg,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: "8px",
            padding: "8px 16px",
            textAlign: "center",
            fontSize: "12px",
            color: textSecondary,
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
          }}>
            <span>🔴 <span style={{ color: theme.accent, fontWeight: 700 }}>{viewersNow}</span> viewing now</span>
            <span>·</span>
            <span><span style={{ color: theme.accent, fontWeight: 700 }}>{enteredToday.toLocaleString()}</span> entered today</span>
          </div>

          <AnimatePresence mode="wait">

            {step === "spin" && (
              <motion.div key="spin" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: "clamp(20px, 5vw, 26px)",
                  fontWeight: 700,
                  color: textPrimary,
                  marginBottom: "20px",
                  letterSpacing: "0.02em",
                  fontFamily: theme.font,
                  textTransform: "uppercase",
                }}>
                  {theme.title}
                </div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Wheel onWin={handleWin} variant={variant} spinning={spinning} hasSpun={hasSpun} onSpin={handleSpin} />
                </div>
                <SecurityBadges accentColor={theme.accent} textColor={textSecondary} />
                <div style={{ marginTop: "16px", display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
                  {["No purchase needed", "US residents", "18+"].map((t) => (
                    <div key={t} style={{ fontSize: "11px", color: textSecondary }}>✓ {t}</div>
                  ))}
                </div>
                <div style={{ marginTop: "10px", display: "flex", justifyContent: "center", gap: "16px" }}>
                  <a href="/legal/privacy" style={{ fontSize: "11px", color: textSecondary, opacity: 0.4, textDecoration: "none" }}>Privacy Policy</a>
                  <a href="/legal/terms" style={{ fontSize: "11px", color: textSecondary, opacity: 0.4, textDecoration: "none" }}>Terms</a>
                </div>
              </motion.div>
            )}

            {step === "win" && (
              <motion.div key="win" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ textAlign: "center", padding: "40px 0" }}>
                <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ fontSize: "80px", marginBottom: "16px" }}>🏆</motion.div>
                <div style={{ fontSize: "clamp(36px, 10vw, 56px)", fontWeight: 700, color: theme.winColor, fontFamily: theme.font, textTransform: "uppercase", textShadow: `0 0 40px ${theme.winColor}80` }}>
                  {theme.winTitle}
                </div>
                <div style={{ fontSize: "18px", color: textPrimary, marginTop: "8px" }}>Claim your prize now</div>
              </motion.div>
            )}

            {step === "email" && (
              <motion.div key="email" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: "20px", padding: "28px 24px" }}>
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <div style={{ fontSize: "48px", marginBottom: "8px" }}>🎁</div>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: textPrimary, fontFamily: theme.font, textTransform: "uppercase" }}>Claim Your Prize!</div>
                  <div style={{ fontSize: "14px", color: textSecondary, marginTop: "6px" }}>Enter your email to receive your winnings</div>
                </div>
                <form onSubmit={handleEmailSubmit}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: `2px solid ${theme.accent}`, background: "transparent", color: textPrimary, fontSize: "16px", marginBottom: "12px", outline: "none", boxSizing: "border-box" }}
                  />
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.97 }}
                    style={{ width: "100%", padding: "16px", background: loading ? "#333" : theme.accent, color: loading ? "#666" : "#000", fontWeight: 800, fontSize: "16px", border: "none", borderRadius: "12px", cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.04em", fontFamily: theme.font, textTransform: "uppercase", boxShadow: loading ? "none" : `0 8px 24px ${theme.accent}40` }}
                  >
                    {loading ? "Processing..." : "CLAIM MY PRIZE →"}
                  </motion.button>
                </form>
                <div style={{ fontSize: "11px", color: textSecondary, textAlign: "center", marginTop: "12px", opacity: 0.6 }}>
                  By entering you agree to our <a href="/legal/terms" style={{ color: textSecondary }}>terms</a>. No spam ever.
                </div>
              </motion.div>
            )}

            {step === "phone" && (
              <motion.div key="phone" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: "20px", padding: "28px 24px" }}>
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <div style={{ fontSize: "48px", marginBottom: "8px" }}>📱</div>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: textPrimary, fontFamily: theme.font, textTransform: "uppercase" }}>Double Your Chances!</div>
                  <div style={{ display: "inline-block", background: theme.accent, color: "#000", fontWeight: 800, fontSize: "12px", padding: "4px 14px", borderRadius: "20px", marginTop: "8px", letterSpacing: "0.06em" }}>2× MORE ENTRIES</div>
                  <div style={{ fontSize: "14px", color: textSecondary, marginTop: "10px" }}>Add your phone number for twice the chances to win</div>
                </div>
                <form onSubmit={handlePhoneSubmit}>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: `2px solid ${theme.accent}`, background: "transparent", color: textPrimary, fontSize: "16px", marginBottom: "12px", outline: "none", boxSizing: "border-box" }}
                  />
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.97 }}
                    style={{ width: "100%", padding: "16px", background: loading ? "#333" : theme.accent, color: loading ? "#666" : "#000", fontWeight: 800, fontSize: "16px", border: "none", borderRadius: "12px", cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.04em", fontFamily: theme.font, textTransform: "uppercase", boxShadow: loading ? "none" : `0 8px 24px ${theme.accent}40` }}
                  >
                    {loading ? "Processing..." : "2× MY ENTRIES →"}
                  </motion.button>
                </form>
                <button onClick={() => setStep("done")} style={{ width: "100%", background: "transparent", border: "none", color: textSecondary, fontSize: "13px", marginTop: "12px", cursor: "pointer", padding: "8px", opacity: 0.6 }}>
                  No thanks, skip
                </button>
              </motion.div>
            )}

            {step === "done" && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "40px 0" }}>
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: 3, duration: 0.5 }} style={{ fontSize: "80px", marginBottom: "16px" }}>✅</motion.div>
                <div style={{ fontSize: "32px", fontWeight: 700, color: textPrimary, fontFamily: theme.font, textTransform: "uppercase" }}>You&apos;re Entered!</div>
                <div style={{ fontSize: "15px", color: textSecondary, marginTop: "8px" }}>We&apos;ll contact you if you win. Good luck!</div>
                <div style={{ marginTop: "24px", padding: "16px", background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: "12px" }}>
                  <div style={{ fontSize: "12px", color: textSecondary, marginBottom: "4px" }}>Your entry number</div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: theme.accent, fontFamily: "monospace" }}>
                    #{Math.floor(Math.random() * 90000) + 10000}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </>
  )
}