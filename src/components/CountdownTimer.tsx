"use client"

import { useEffect, useState } from "react"

export default function CountdownTimer({ accentColor, textColor }: { accentColor: string; textColor: string }) {
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    function getTimeLeft() {
      const now = new Date()
      const midnight = new Date()
      midnight.setHours(23, 59, 59, 999)
      const diff = midnight.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      return { hours, minutes, seconds }
    }

    setTime(getTimeLeft())
    const interval = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(interval)
  }, [])

  const pad = (n: number) => String(n).padStart(2, "0")

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", marginBottom: "12px" }}>
      <span style={{ fontSize: "11px", color: textColor, opacity: 0.6, marginRight: "4px" }}>Offer expires in</span>
      {[pad(time.hours), pad(time.minutes), pad(time.seconds)].map((val, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{
            background: "rgba(0,0,0,0.4)",
            border: `1px solid ${accentColor}40`,
            borderRadius: "6px",
            padding: "3px 7px",
            fontSize: "14px",
            fontWeight: 700,
            color: accentColor,
            fontFamily: "monospace",
            minWidth: "32px",
            textAlign: "center",
          }}>{val}</span>
          {i < 2 && <span style={{ color: accentColor, fontWeight: 700, fontSize: "14px" }}>:</span>}
        </span>
      ))}
    </div>
  )
}