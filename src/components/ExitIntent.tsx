"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  getExitIntentShows,
  incrementExitIntentShows,
  getLastExitShown,
  setLastExitShown,
  isReturner,
} from "@/lib/session"
import { capture } from "@/lib/posthog"

interface ExitIntentProps {
  offerId: string
  variant: string
  maxShows: number
  cooldownHours: number
  skipReturners: boolean
  onSubmit: (email: string, firstName: string, lastName: string) => void
  accentColor: string
  isLight?: boolean
}

export default function ExitIntent({
  offerId,
  variant,
  maxShows,
  cooldownHours,
  skipReturners,
  onSubmit,
  accentColor,
  isLight = false,
}: ExitIntentProps) {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [scrollDepth, setScrollDepth] = useState(0)
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const depth = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      )
      setScrollDepth(depth)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY > 10) return
      if (triggered) return
      if (scrollDepth < 40) return
      if (skipReturners && isReturner()) return

      const shows = getExitIntentShows(offerId)
      if (shows >= maxShows) return

      const lastShown = getLastExitShown(offerId)
      const cooldownMs = cooldownHours * 60 * 60 * 1000
      if (lastShown && Date.now() - lastShown < cooldownMs) return

      setTriggered(true)
      setVisible(true)
      incrementExitIntentShows(offerId)
      setLastExitShown(offerId)
      capture("exit_intent_shown", { offerId, variant, scrollDepth })
    }

    document.addEventListener("mouseleave", handleMouseLeave)
    return () => document.removeEventListener("mouseleave", handleMouseLeave)
  }, [scrollDepth, triggered])

  function handleClose() {
    setVisible(false)
    capture("exit_intent_closed", { offerId, variant })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !firstName || !lastName) return
    onSubmit(email, firstName, lastName)
    setVisible(false)
    capture("exit_intent_submitted", { offerId, variant, email })
  }

  const textColor = isLight ? "#111" : "#fff"
  const subColor = isLight ? "#555" : "#aaa"
  const bgColor = isLight ? "#fff" : "#0d0d0d"
  const borderColor = isLight ? "#e5e5e5" : "#222"

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: `1.5px solid ${accentColor}`,
    background: "transparent",
    color: textColor,
    fontSize: "15px",
    marginBottom: "10px",
    outline: "none",
    boxSizing: "border-box" as const,
    fontFamily: "Inter, sans-serif",
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 999, backdropFilter: "blur(4px)" }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            style={{
              position: "fixed",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
              width: "90%", maxWidth: "420px",
              background: bgColor,
              border: `1px solid ${borderColor}`,
              borderRadius: "24px",
              padding: "32px 24px",
              textAlign: "center",
            }}
          >
            <button onClick={handleClose} style={{ position: "absolute", top: "16px", right: "16px", background: "transparent", border: "none", color: subColor, fontSize: "20px", cursor: "pointer" }}>
              ✕
            </button>

            <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.5, delay: 0.3 }} style={{ fontSize: "52px", marginBottom: "14px" }}>
              🚨
            </motion.div>

            <div style={{ fontSize: "22px", fontWeight: 900, color: accentColor, marginBottom: "6px", lineHeight: 1.2, fontFamily: "Oswald, sans-serif", textTransform: "uppercase" as const }}>
              Wait! Don&apos;t leave yet!
            </div>
            <div style={{ fontSize: "14px", color: textColor, marginBottom: "6px", fontWeight: 600 }}>
              Your prize is still unclaimed
            </div>
            <div style={{ fontSize: "13px", color: subColor, marginBottom: "20px", lineHeight: 1.6 }}>
              Enter your details below and we&apos;ll hold your spot for 24 hours.
            </div>

            <div style={{ background: accentColor, color: "#000", borderRadius: "8px", padding: "8px 16px", fontSize: "12px", fontWeight: 800, letterSpacing: "0.06em", marginBottom: "18px", fontFamily: "Oswald, sans-serif" }}>
              ⚡ ONLY 3 SPOTS LEFT TODAY
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" required style={inputStyle} />
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" required style={inputStyle} />
              </div>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required style={inputStyle} />
              <button type="submit" style={{ width: "100%", padding: "15px", background: accentColor, color: "#000", fontWeight: 900, fontSize: "15px", border: "none", borderRadius: "12px", cursor: "pointer", letterSpacing: "0.04em", fontFamily: "Oswald, sans-serif", textTransform: "uppercase" as const }}>
                CLAIM MY SPOT →
              </button>
            </form>

            <button onClick={handleClose} style={{ background: "transparent", border: "none", color: subColor, fontSize: "12px", marginTop: "12px", cursor: "pointer", padding: "8px" }}>
              No thanks, I don&apos;t want to win
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}