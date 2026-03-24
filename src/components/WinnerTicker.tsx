"use client"

import { useEffect, useState } from "react"

const FIRST_NAMES = ["James", "Sarah", "Mike", "Jessica", "Tyler", "Ashley", "Brandon", "Emily", "Chris", "Megan", "Derek", "Brittany", "Jordan", "Kayla", "Nathan", "Samantha", "Austin", "Lauren", "Ryan", "Amanda"]
const STATES = ["TX", "CA", "FL", "NY", "OH", "PA", "IL", "GA", "NC", "MI", "AZ", "WA", "CO", "TN", "IN"]
const PRIZES = ["$500", "$250", "$1,000", "$500", "$250", "$500", "$750", "$250", "$500", "$1,000"]

function generateWinner() {
  return {
    name: FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)],
    state: STATES[Math.floor(Math.random() * STATES.length)],
    prize: PRIZES[Math.floor(Math.random() * PRIZES.length)],
    time: `${Math.floor(Math.random() * 59) + 1}m ago`,
  }
}

export default function WinnerTicker({ accentColor }: { accentColor: string }) {
  const [winner, setWinner] = useState(generateWinner())
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setWinner(generateWinner())
        setVisible(true)
      }, 400)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      background: "rgba(0,0,0,0.3)",
      border: `1px solid ${accentColor}30`,
      borderRadius: "50px",
      padding: "6px 14px",
      fontSize: "12px",
      marginBottom: "12px",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.3s ease",
    }}>
      <span style={{ fontSize: "14px" }}>🏆</span>
      <span style={{ color: "#aaa" }}>
        <span style={{ color: accentColor, fontWeight: 700 }}>{winner.name} from {winner.state}</span>
        {" "}just won{" "}
        <span style={{ color: "#fff", fontWeight: 700 }}>{winner.prize}</span>
        {" "}· {winner.time}
      </span>
    </div>
  )
}