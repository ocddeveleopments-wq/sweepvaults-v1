"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const WINNERS = [
  { name: "James T.", state: "Texas", prize: "$500", avatar: "JT" },
  { name: "Sarah M.", state: "California", prize: "$250", avatar: "SM" },
  { name: "Mike R.", state: "Florida", prize: "$1,000", avatar: "MR" },
  { name: "Jessica L.", state: "New York", prize: "$500", avatar: "JL" },
  { name: "Tyler B.", state: "Ohio", prize: "$250", avatar: "TB" },
  { name: "Ashley K.", state: "Georgia", prize: "$750", avatar: "AK" },
  { name: "Brandon W.", state: "Illinois", prize: "$500", avatar: "BW" },
  { name: "Emily C.", state: "Pennsylvania", prize: "$1,000", avatar: "EC" },
  { name: "Chris D.", state: "Arizona", prize: "$250", avatar: "CD" },
  { name: "Megan H.", state: "Colorado", prize: "$500", avatar: "MH" },
]

export default function RecentWinnersPopup({ accentColor }: { accentColor: string }) {
  const [visible, setVisible] = useState(false)
  const [winner, setWinner] = useState(WINNERS[0])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    // First popup after 8 seconds
    const first = setTimeout(() => {
      setVisible(true)
      setTimeout(() => setVisible(false), 4000)
    }, 8000)

    // Then every 25-35 seconds
    const interval = setInterval(() => {
      const next = (index + 1) % WINNERS.length
      setIndex(next)
      setWinner(WINNERS[next])
      setVisible(true)
      setTimeout(() => setVisible(false), 4000)
    }, Math.floor(Math.random() * 10000) + 25000)

    return () => {
      clearTimeout(first)
      clearInterval(interval)
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -100, y: 0 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          style={{
            position: "fixed",
            bottom: "24px",
            left: "16px",
            zIndex: 998,
            background: "#111",
            border: `1px solid ${accentColor}40`,
            borderRadius: "16px",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            maxWidth: "280px",
            boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}20`,
          }}
        >
          {/* Avatar */}
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}88)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: 700,
            color: "#000",
            flexShrink: 0,
          }}>
            {winner.avatar}
          </div>

          {/* Info */}
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "2px" }}>
              {winner.name} from {winner.state}
            </div>
            <div style={{ fontSize: "12px", color: "#888" }}>
              Just won <span style={{ color: accentColor, fontWeight: 700 }}>{winner.prize}</span> 🎉
            </div>
          </div>

          {/* Close */}
          <button
            onClick={() => setVisible(false)}
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "transparent",
              border: "none",
              color: "#444",
              fontSize: "12px",
              cursor: "pointer",
              padding: "2px",
            }}
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}