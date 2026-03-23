"use client"

import { useState, useEffect } from "react"
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

const THEMES = {
  v1: {
    bg: "radial-gradient(ellipse at 50% 40%, #1a1200 0%, #080600 60%, #000 100%)",
    accent: "#FFD700",
    accentDim: "#B8860B",
    accentGlow: "rgba(255,215,0,0.3)",
    accentBorder: "rgba(255,215,0,0.15)",
    textPrimary: "#fff",
    textSecondary: "#999",
    isLight: false,
    winTitle: "YOU WON!",
    winColor: "#FFD700",
    subtitle: "Spin the wheel — everyone's a winner",
  },
  v2: {
    bg: "radial-gradient(ellipse at 50% 40%, #1a0000 0%, #080000 60%, #000 100%)",
    accent: "#FF2222",
    accentDim: "#AA0000",
    accentGlow: "rgba(255,34,34,0.35)",
    accentBorder: "rgba(255,34,34,0.15)",
    textPrimary: "#fff",
    textSecondary: "#999",
    isLight: false,
    winTitle: "ON FIRE! 🔥",
    winColor: "#FF2222",
    subtitle: "Your prize is one spin away",
  },
  v3: {
    bg: "radial-gradient(ellipse at 50% 40%, #1a0030 0%, #08000f 60%, #000 100%)",
    accent: "#A855F7",
    accentDim: "#7C3AED",
    accentGlow: "rgba(168,85,247,0.35)",
    accentBorder: "rgba(168,85,247,0.15)",
    textPrimary: "#fff",
    textSecondary: "#999",
    isLight: false,
    winTitle: "JACKPOT! ⚡",
    winColor: "#A855F7",
    subtitle: "Spin to unlock your prize",
  },
  v4: {
    bg: "radial-gradient(ellipse at 50% 40%, #dcfce7 0%, #f0fdf4 60%, #fff 100%)",
    accent: "#059669",
    accentDim: "#047857",
    accentGlow: "rgba(5,150,105,0.2)",
    accentBorder: "rgba(5,150,105,0.2)",
    textPrimary: "#111",
    textSecondary: "#555",
    isLight: true,
    winTitle: "WINNER! ✓",
    winColor: "#059669",
    subtitle: "Free entry — no purchase necessary",
  },
  v5: {
    bg: "radial-gradient(ellipse at 50% 40%, #1a0000 0%, #080000 60%, #000 100%)",
    accent: "#FF0000",
    accentDim: "#CC0000",
    accentGlow: "rgba(255,0,0,0.4)",
    accentBorder: "rgba(255,0,0,0.15)",
    textPrimary: "#fff",
    textSecondary: "#999",
    isLight: false,
    winTitle: "MEGA WIN! 💥",
    winColor: "#FF0000",
    subtitle: "The biggest prize of the year",
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
      confetti({ particleCount: 100, spread: 130, origin: { x, y: 0.5 }, colors: ["#A855F7", "#EC4899", "#06B6D4", "#10B981"], shapes: ["star"], startVelocity: 50 })
    })
  } else if (variant === "v4") {
    confetti({ particleCount: 180, spread: 100, origin: { y: 0.6 }, colors: ["#059669", "#10B981", "#fff", "#BBF7D0"] })
  } else {
    confetti({ particleCount: 400, spread: 200, origin: { y: 0.4 }, colors: ["#FF0000", "#FFD700", "#fff"], shapes: ["star", "circle"], startVelocity: 90 })
    setTimeout(() => {
      confetti({ particleCount: 200, spread: 160, origin: { x: 0.1, y: 0.6 }, colors: ["#FF0000", "#FFD700"] })
      confetti({ particleCount: 200, spread: 160, origin: { x: 0.9, y: 0.6 }, colors: ["#FF0000", "#FFD700"] })
    }, 400)
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

function playSound(type: "win" | "click") {
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
    } else {
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
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
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

  const theme = THEMES[variant as keyof typeof THEMES] ?? THEMES.v1

  useEffect(() => {
    initPostHog()
    const sid = getSessionId()
    const vid = getVisitorId()
    setSessionId(sid)
    setVisitorId(vid)
    const utms = getUTMParams()
    capture("page_view", { offerId: offer.id, locale, variant, sessionId: sid, visitorId: vid, returner: isReturner(), ...utms })
    trackEvent({ event: "page_view", offerId: offer.id, locale, variant, sessionId: sid, visitorId: vid })

    const baseSpots = Math.floor(Math.random() * 35) + 12
    setSpotsLeft(baseSpots)
    const hour = new Date().getHours()
    setEnteredToday(1200 + hour * 180 + Math.floor(Math.random() * 300))
    setViewersNow(Math.floor(Math.random() * 18) + 8)

    const spotsInterval = setInterval(() => {
      setSpotsLeft((p) => (p <= 3 ? p : Math.random() > 0.6 ? p - 1 : p))
    }, Math.floor(Math.random() * 7000) + 8000)

    const viewersInterval = setInterval(() => {
      setViewersNow((p) => Math.max(5, Math.min(30, p + Math.floor(Math.random() * 3) - 1)))
    }, 5000)

    return () => { clearInterval(spotsInterval); clearInterval(viewersInterval) }
  }, [])

  function handleSpin() {
    setSpinning(true)
    playSound("click")
    capture("spin_clicked", { offerId: offer.id, variant })
  }

  async function handleWin() {
    setSpinning(false)
    setHasSpun(true)
    if (variant === "v3" || variant === "v5") { setShake(true); setTimeout(() => setShake(false), 600) }
    fireWinAnimation(variant)
    playSound("win")
    capture("win_reveal_shown", { offerId: offer.id, variant })
    setStep("win")
    setTimeout(() => setStep("email"), 2800)
  }

  async function postToAffiliate(emailVal: string, leadId: string, first: string, last: string) {
  if (!offer.affiliatePostUrl || process.env.NEXT_PUBLIC_TEST_MODE === "true") return
  try {
    const url = new URL(offer.affiliatePostUrl)
    url.searchParams.set("email", emailVal)
    if (first) url.searchParams.set("firstName", first)
    if (last) url.searchParams.set("lastName", last)
    if (offer.subParam) url.searchParams.set(offer.subParam, leadId)
    fetch(url.toString(), { mode: "no-cors" }).catch(() => {})
  } catch {}
}

async function saveLeadAPI(data: Record<string, any>) {
  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return res.json()
}

  async function handleEmailSubmit(e: React.FormEvent) {
  e.preventDefault()
  if (!email || !firstName || !lastName) return
  setLoading(true)
  playSound("click")
  const utms = getUTMParams()
  const result = await saveLeadAPI({
    offerId: offer.id,
    email,
    firstName,
    lastName,
    locale,
    variant,
    sessionId,
    visitorId,
    ...utms,
  })
  if (result.success && result.leadId) {
    capture("email_submitted", { offerId: offer.id, variant, locale })
    await postToAffiliate(email, result.leadId, firstName, lastName)
  }
  setLoading(false)
  setStep("phone")
}

  async function handleExitIntentSubmit(emailVal: string, firstName: string, lastName: string) {
  const result = await saveLeadAPI({
    offerId: offer.id,
    email: emailVal,
    firstName,
    lastName,
    locale,
    variant: `${variant}_exit`,
    sessionId,
    visitorId,
  })
  if (result.success && result.leadId) await postToAffiliate(emailVal, result.leadId, firstName, lastName)
}

  async function handlePhoneSubmit(e: React.FormEvent) {
  e.preventDefault()
  if (!phone) return
  setLoading(true)
  playSound("click")
  await saveLeadAPI({
    offerId: offer.id,
    email,
    phone,
    firstName,
    lastName,
    locale,
    variant,
    sessionId,
    visitorId,
  })
  capture("phone_upsell_submitted", { offerId: offer.id, variant, locale })
  setLoading(false)
  setStep("done")
}

  const cssVars = {
    "--accent": theme.accent,
    "--accent-glow": theme.accentGlow,
    "--accent-border": theme.accentBorder,
  } as React.CSSProperties

  return (
    <>
      <ScrollTracker offerId={offer.id} variant={variant} locale={locale} sessionId={sessionId} visitorId={visitorId} />
      <RecentWinnersPopup accentColor={theme.accent} />
      {offer.exitIntentEnabled && step === "spin" && (
        <ExitIntent offerId={offer.id} variant={variant} maxShows={offer.exitIntentMaxShows} cooldownHours={offer.exitIntentCooldownHours} skipReturners={offer.exitIntentSkipReturners} onSubmit={handleExitIntentSubmit} accentColor={theme.accent} isLight={theme.isLight} />
      )}

      <motion.div
        animate={shake ? { x: [-8, 8, -8, 8, -4, 4, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="spin-page"
        style={{ ...cssVars, background: theme.bg }}
      >
        <div className="spin-container">

          <ProgressBar step={step} accentColor={theme.accent} />

          <div className="ticker-wrap">
            <WinnerTicker accentColor={theme.accent} />
          </div>

          <CountdownTimer accentColor={theme.accent} textColor={theme.textSecondary} />

          <motion.div
            className="urgency-bar"
            animate={{ opacity: spotsLeft <= 10 ? [1, 0.65, 1] : 1 }}
            transition={{ repeat: spotsLeft <= 10 ? Infinity : 0, duration: 1.2 }}
            style={{
              background: spotsLeft <= 10
                ? "linear-gradient(90deg, #CC0000, #FF2222)"
                : `linear-gradient(90deg, ${theme.accentDim}, ${theme.accent})`,
              color: "#000",
            }}
          >
            ⚡ ONLY {spotsLeft || "?"} SPOTS REMAINING · {viewersNow} VIEWING NOW
          </motion.div>

          <div className="spin-logo" style={{ color: theme.accent, textShadow: `0 0 40px ${theme.accentGlow}` }}>
            SweepVaults
          </div>
          <div className="spin-tagline" style={{ color: theme.textSecondary }}>
            {theme.subtitle}
          </div>

          <div className="social-bar">
            <div className="social-item" style={{ color: theme.textSecondary }}>
              🔴 <span style={{ color: theme.accent, fontWeight: 600 }}>{viewersNow}</span> viewing
            </div>
            <div className="social-item" style={{ color: theme.textSecondary }}>
              🏆 <span style={{ color: theme.accent, fontWeight: 600 }}>{enteredToday.toLocaleString()}</span> entered today
            </div>
          </div>

          <AnimatePresence mode="wait">

            {step === "spin" && (
              <motion.div key="spin" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="spin-title" style={{ color: theme.textPrimary }}>
                  Win $25,000 Cash
                </div>
                <div className="wheel-outer">
                  <div className="wheel-glow-ring" style={{ background: `radial-gradient(circle, ${theme.accentGlow} 0%, transparent 70%)` }} />
                  <Wheel onWin={handleWin} variant={variant} spinning={spinning} hasSpun={hasSpun} onSpin={handleSpin} />
                </div>
                <SecurityBadges accentColor={theme.accent} textColor={theme.textSecondary} />
                <div className="trust-row">
                  {["No purchase needed", "US residents", "18+"].map((t) => (
                    <div key={t} className="trust-item" style={{ color: theme.textSecondary }}>✓ {t}</div>
                  ))}
                </div>
                <div className="legal-row">
                  <a href="/legal/privacy" style={{ color: theme.textSecondary }}>Privacy Policy</a>
                  <a href="/legal/terms" style={{ color: theme.textSecondary }}>Terms</a>
                </div>
              </motion.div>
            )}

            {step === "win" && (
              <motion.div key="win" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="win-screen">
                <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ fontSize: "80px", marginBottom: "16px" }}>🏆</motion.div>
                <div className="win-title" style={{ color: theme.winColor, textShadow: `0 0 40px ${theme.accentGlow}` }}>
                  {theme.winTitle}
                </div>
                <div className="win-sub" style={{ color: theme.textPrimary }}>Claim your prize now</div>
              </motion.div>
            )}

            {step === "email" && (
              <motion.div key="email" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={theme.isLight ? "glass-card-light" : "glass-card"}>
                <div style={{ textAlign: "center", marginBottom: "22px" }}>
                  <div style={{ fontSize: "52px", marginBottom: "10px" }}>🎁</div>
                  <div className="spin-title" style={{ color: theme.textPrimary, fontSize: "22px", marginBottom: "6px" }}>Claim Your Prize!</div>
                  <div style={{ fontSize: "14px", color: theme.textSecondary }}>Enter your email to receive your winnings</div>
                </div>
                <form onSubmit={handleEmailSubmit}>
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "0" }}>
    <input
      type="text"
      value={firstName}
      onChange={(e) => setFirstName(e.target.value)}
      placeholder="First name"
      required
      className={theme.isLight ? "spin-input-light" : "spin-input"}
      style={{ color: theme.textPrimary }}
    />
    <input
      type="text"
      value={lastName}
      onChange={(e) => setLastName(e.target.value)}
      placeholder="Last name"
      required
      className={theme.isLight ? "spin-input-light" : "spin-input"}
      style={{ color: theme.textPrimary }}
    />
  </div>
  <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="your@email.com"
    required
    className={theme.isLight ? "spin-input-light" : "spin-input"}
    style={{ color: theme.textPrimary }}
  />
  <motion.button
    type="submit"
    disabled={loading}
    whileTap={{ scale: 0.97 }}
    className="spin-cta"
    style={{
      background: loading ? "#333" : `linear-gradient(135deg, ${theme.accentDim}, ${theme.accent})`,
      color: loading ? "#666" : "#000",
      boxShadow: loading ? "none" : `0 8px 28px ${theme.accentGlow}`,
    }}
  >
    {loading ? "Processing..." : "CLAIM MY PRIZE →"}
  </motion.button>
</form>
                <div style={{ fontSize: "11px", color: theme.textSecondary, textAlign: "center", marginTop: "12px", opacity: 0.5 }}>
                  By entering you agree to our <a href="/legal/terms" style={{ color: theme.textSecondary }}>terms</a>. No spam ever.
                </div>
              </motion.div>
            )}

            {step === "phone" && (
              <motion.div key="phone" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={theme.isLight ? "glass-card-light" : "glass-card"}>
                <div style={{ textAlign: "center", marginBottom: "22px" }}>
                  <div style={{ fontSize: "52px", marginBottom: "10px" }}>📱</div>
                  <div className="spin-title" style={{ color: theme.textPrimary, fontSize: "22px", marginBottom: "8px" }}>Double Your Chances!</div>
                  <div className="upsell-badge" style={{ background: theme.accent, color: "#000" }}>2× MORE ENTRIES</div>
                  <div style={{ fontSize: "14px", color: theme.textSecondary, marginTop: "10px" }}>Add your phone for twice the chances to win</div>
                </div>
                <form onSubmit={handlePhoneSubmit}>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className={theme.isLight ? "spin-input-light" : "spin-input"} style={{ color: theme.textPrimary }} />
                  <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }} className="spin-cta" style={{ background: loading ? "#333" : `linear-gradient(135deg, ${theme.accentDim}, ${theme.accent})`, color: loading ? "#666" : "#000", boxShadow: loading ? "none" : `0 8px 28px ${theme.accentGlow}` }}>
                    {loading ? "Processing..." : "2× MY ENTRIES →"}
                  </motion.button>
                </form>
                <button onClick={() => setStep("done")} className="skip-btn" style={{ color: theme.textSecondary }}>
                  No thanks, skip
                </button>
              </motion.div>
            )}

            {step === "done" && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="done-screen">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: 3, duration: 0.5 }} style={{ fontSize: "80px", marginBottom: "16px" }}>✅</motion.div>
                <div className="win-title" style={{ color: theme.textPrimary, fontSize: "32px" }}>You&apos;re Entered!</div>
                <div className="win-sub" style={{ color: theme.textSecondary }}>We&apos;ll contact you if you win. Good luck!</div>
                <div className="entry-card">
                  <div className="entry-label" style={{ color: theme.textSecondary }}>Your entry number</div>
                  <div className="entry-num" style={{ color: theme.accent }}>
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