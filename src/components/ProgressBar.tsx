"use client"

import { motion } from "framer-motion"

type Step = "spin" | "win" | "email" | "phone" | "done"

const STEPS = [
  { key: "spin", label: "Spin" },
  { key: "win", label: "Win" },
  { key: "email", label: "Claim" },
  { key: "phone", label: "Boost" },
  { key: "done", label: "Done" },
]

export default function ProgressBar({ step, accentColor }: { step: Step; accentColor: string }) {
  const currentIndex = STEPS.findIndex((s) => s.key === step)
  const pct = Math.round((currentIndex / (STEPS.length - 1)) * 100)

  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        {STEPS.map((s, i) => (
          <div
            key={s.key}
            style={{
              fontSize: "10px",
              fontWeight: i <= currentIndex ? 700 : 400,
              color: i <= currentIndex ? accentColor : "#333",
              letterSpacing: "0.06em",
              transition: "color 0.3s",
            }}
          >
            {s.label.toUpperCase()}
          </div>
        ))}
      </div>
      <div style={{ height: "4px", background: "#1a1a1a", borderRadius: "2px", overflow: "hidden" }}>
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            height: "100%",
            background: `linear-gradient(90deg, ${accentColor}88, ${accentColor})`,
            borderRadius: "2px",
            boxShadow: `0 0 8px ${accentColor}60`,
          }}
        />
      </div>
    </div>
  )
}