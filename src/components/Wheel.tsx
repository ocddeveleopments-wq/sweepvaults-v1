"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

const SEGMENTS = [
  { label: "$500 Cash", color: "#FFD700" },
  { label: "Try Again", color: "#FF6B6B" },
  { label: "$1,000 Cash", color: "#4ECDC4" },
  { label: "Try Again", color: "#FF6B6B" },
  { label: "$250 Gift Card", color: "#45B7D1" },
  { label: "Try Again", color: "#FF6B6B" },
  { label: "$750 Cash", color: "#96CEB4" },
  { label: "Try Again", color: "#FF6B6B" },
]

const WINNING_INDEX = 0 // always lands on $500 Cash

interface WheelProps {
  onWin: () => void
  variant?: string
}

export default function Wheel({ onWin, variant = "v1" }: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [spinning, setSpinning] = useState(false)
  const [hasSpun, setHasSpun] = useState(false)
  const rotationRef = useRef(0)

  const segmentAngle = (2 * Math.PI) / SEGMENTS.length

  function drawWheel(rotation: number) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const radius = cx - 10

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    SEGMENTS.forEach((seg, i) => {
      const startAngle = rotation + i * segmentAngle
      const endAngle = startAngle + segmentAngle

      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = seg.color
      ctx.fill()
      ctx.strokeStyle = "#fff"
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(startAngle + segmentAngle / 2)
      ctx.textAlign = "right"
      ctx.fillStyle = "#1a1a1a"
      ctx.font = "bold 13px sans-serif"
      ctx.fillText(seg.label, radius - 10, 5)
      ctx.restore()
    })

    // Center circle
    ctx.beginPath()
    ctx.arc(cx, cy, 24, 0, 2 * Math.PI)
    ctx.fillStyle = "#fff"
    ctx.fill()
    ctx.strokeStyle = "#ddd"
    ctx.lineWidth = 2
    ctx.stroke()
  }

  useEffect(() => {
    drawWheel(0)
  }, [])

  function spin() {
    if (spinning || hasSpun) return
    setSpinning(true)

    const targetSegment = WINNING_INDEX
    const extraSpins = 8
    const targetAngle =
      2 * Math.PI * extraSpins +
      (2 * Math.PI - targetSegment * segmentAngle - segmentAngle / 2)

    const duration = 4000
    const startTime = performance.now()
    const startRotation = rotationRef.current

    function animate(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      const currentRotation = startRotation + targetAngle * eased

      rotationRef.current = currentRotation
      drawWheel(currentRotation)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setSpinning(false)
        setHasSpun(true)
        setTimeout(() => onWin(), 800)
      }
    }

    requestAnimationFrame(animate)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-1/2 right-0 translate-x-2 -translate-y-1/2 z-10">
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: "12px solid transparent",
              borderBottom: "12px solid transparent",
              borderRight: "24px solid #FF4444",
            }}
          />
        </div>
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="rounded-full shadow-2xl"
        />
      </div>

      <motion.button
        onClick={spin}
        disabled={spinning || hasSpun}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        className="px-10 py-4 rounded-full text-white font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: spinning || hasSpun
            ? "#ccc"
            : "linear-gradient(135deg, #FF6B35, #F7C59F)",
        }}
      >
        {spinning ? "Spinning..." : hasSpun ? "Claimed!" : "SPIN TO WIN"}
      </motion.button>
    </div>
  )
}