"use client"

import { useEffect, useRef, useState } from "react"
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
  const [visible, setVisible]     = useState(false)
  const [email, setEmail]         = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName]   = useState("")

  const triggeredRef       = useRef(false)
  const hasScrolledDownRef = useRef(false)

  function canShow() {
    if (triggeredRef.current) return false
    if (skipReturners && isReturner()) return false
    const shows = getExitIntentShows(offerId)
    if (shows >= maxShows) return false
    const lastShown  = getLastExitShown(offerId)
    const cooldownMs = cooldownHours * 60 * 60 * 1000
    if (lastShown && Date.now() - lastShown < cooldownMs) return false
    return true
  }

  function triggerModal(trigger: string) {
    if (!canShow()) return
    triggeredRef.current = true
    incrementExitIntentShows(offerId)
    setLastExitShown(offerId)
    setVisible(true)
    capture("exit_intent_shown", { offerId, variant, trigger })
  }

  // ─── Timed trigger — fires after 8 seconds ─────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerModal("timed_8s")
    }, 8000)
    return () => clearTimeout(timer)
  }, [])

  // ─── Scroll-back trigger — scrolled down then back to top ──────────────
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        hasScrolledDownRef.current = true
      }
      if (hasScrolledDownRef.current && window.scrollY < 50) {
        triggerModal("scroll_back")
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // ─── Visibility change — tab switch / app switch ────────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "hidden") return
      triggerModal("visibility_hidden")
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [])

  // ─── Back button ────────────────────────────────────────────────────────
  useEffect(() => {
    window.history.pushState({ exitIntent: true }, "")
    const handlePopState = () => {
      triggerModal("back_button")
      window.history.pushState({ exitIntent: true }, "")
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  // ─── Handlers ───────────────────────────────────────────────────────────
  function handleClose() {
    setVisible(false)
    triggeredRef.current = false
    capture("exit_intent_closed", { offerId, variant })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !firstName || !lastName) return
    onSubmit(email, firstName, lastName)
    setVisible(false)
    capture("exit_intent_form_submitted", { offerId, variant })
  }

  // ─── Styles ─────────────────────────────────────────────────────────────
  const textColor   = isLight ? "#111" : "#fff"
  const subColor    = isLight ? "#555" : "#aaa"
  const bgColor     = isLight ? "#fff" : "#0d0d0d"
  const borderColor = isLight ? "#e5e5e5" : "#222"

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: `1.5px solid ${accentColor}`,
    background: "transparent",
    color: textColor,
    fontSize: "15px",
    marginBottom: "10px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "Inter, sans-serif",
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.85)",
          zIndex: 999,
          backdropFilter: "blur(4px)",
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: visible
            ? "translate(-50%, -50%) scale(1)"
            : "translate(-50%, -50%) scale(0.85)",
          zIndex: 1000,
          width: "90%",
          maxWidth: "420px",
          background: bgColor,
          border: `1px solid ${borderColor}`,
          borderRadius: "24px",
          padding: "32px 24px",
          textAlign: "center",
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}
      >
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "transparent",
            border: "none",
            color: subColor,
            fontSize: "20px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        <div style={{ fontSize: "52px", marginBottom: "14px" }}>🚨</div>

        <div
          style={{
            fontSize: "22px",
            fontWeight: 900,
            color: accentColor,
            marginBottom: "6px",
            lineHeight: 1.2,
            fontFamily: "var(--font-oswald), sans-serif",
            textTransform: "uppercase",
          }}
        >
          Wait! Don&apos;t leave yet!
        </div>

        <div style={{ fontSize: "14px", color: textColor, marginBottom: "6px", fontWeight: 600 }}>
          Your prize is still unclaimed
        </div>

        <div style={{ fontSize: "13px", color: subColor, marginBottom: "20px", lineHeight: 1.6 }}>
          Enter your details below and we&apos;ll hold your spot for 24 hours.
        </div>

        <div
          style={{
            background: accentColor,
            color: "#000",
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "0.06em",
            marginBottom: "18px",
            fontFamily: "var(--font-oswald), sans-serif",
          }}
        >
          ⚡ ONLY 3 SPOTS LEFT TODAY
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              required
              style={inputStyle}
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              required
              style={inputStyle}
            />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            style={inputStyle}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "15px",
              background: accentColor,
              color: "#000",
              fontWeight: 900,
              fontSize: "15px",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              letterSpacing: "0.04em",
              fontFamily: "var(--font-oswald), sans-serif",
              textTransform: "uppercase",
            }}
          >
            CLAIM MY SPOT →
          </button>
        </form>

        <button
          onClick={handleClose}
          style={{
            background: "transparent",
            border: "none",
            color: subColor,
            fontSize: "12px",
            marginTop: "12px",
            cursor: "pointer",
            padding: "8px",
          }}
        >
          No thanks, I don&apos;t want to win
        </button>
      </div>
    </>
  )
}