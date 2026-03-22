"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

const VARIANT_CONFIGS = {
  v1: {
    segments: [
      { label: "$25,000", color: "#FFD700", textColor: "#1a1a00" },
      { label: "Try Again", color: "#1a1a1a", textColor: "#FFD700" },
      { label: "$500", color: "#CFB53B", textColor: "#1a1a00" },
      { label: "Try Again", color: "#111111", textColor: "#CFB53B" },
      { label: "$1,000", color: "#FFD700", textColor: "#1a1a00" },
      { label: "Try Again", color: "#1a1a1a", textColor: "#FFD700" },
      { label: "$250", color: "#CFB53B", textColor: "#1a1a00" },
      { label: "Try Again", color: "#111111", textColor: "#CFB53B" },
    ],
    borderColor: "#FFD700",
    centerColor: "#FFD700",
    btnFrom: "#FFD700",
    btnTo: "#CFB53B",
    btnText: "#1a1a00",
  },
  v2: {
    segments: [
      { label: "$25,000", color: "#FF4500", textColor: "#fff" },
      { label: "Try Again", color: "#1a0a00", textColor: "#FF6B35" },
      { label: "$500", color: "#FF6B35", textColor: "#fff" },
      { label: "Try Again", color: "#1a0a00", textColor: "#FF4500" },
      { label: "$1,000", color: "#FF4500", textColor: "#fff" },
      { label: "Try Again", color: "#1a0a00", textColor: "#FF6B35" },
      { label: "$250", color: "#FF6B35", textColor: "#fff" },
      { label: "Try Again", color: "#1a0a00", textColor: "#FF4500" },
    ],
    borderColor: "#FF4500",
    centerColor: "#FF4500",
    btnFrom: "#FF4500",
    btnTo: "#FF6B35",
    btnText: "#fff",
  },
  v3: {
    segments: [
      { label: "$25,000", color: "#00FFFF", textColor: "#000" },
      { label: "Try Again", color: "#0D0D2B", textColor: "#00FFFF" },
      { label: "$500", color: "#FF00FF", textColor: "#fff" },
      { label: "Try Again", color: "#0D0D2B", textColor: "#FF00FF" },
      { label: "$1,000", color: "#00FF88", textColor: "#000" },
      { label: "Try Again", color: "#0D0D2B", textColor: "#00FF88" },
      { label: "$250", color: "#FFD700", textColor: "#000" },
      { label: "Try Again", color: "#0D0D2B", textColor: "#FFD700" },
    ],
    borderColor: "#00FFFF",
    centerColor: "#FF00FF",
    btnFrom: "#00FFFF",
    btnTo: "#FF00FF",
    btnText: "#000",
  },
  v4: {
    segments: [
      { label: "$25,000", color: "#22C55E", textColor: "#fff" },
      { label: "Try Again", color: "#f8fafc", textColor: "#22C55E" },
      { label: "$500", color: "#16A34A", textColor: "#fff" },
      { label: "Try Again", color: "#f1f5f9", textColor: "#16A34A" },
      { label: "$1,000", color: "#22C55E", textColor: "#fff" },
      { label: "Try Again", color: "#f8fafc", textColor: "#22C55E" },
      { label: "$250", color: "#16A34A", textColor: "#fff" },
      { label: "Try Again", color: "#f1f5f9", textColor: "#16A34A" },
    ],
    borderColor: "#22C55E",
    centerColor: "#22C55E",
    btnFrom: "#22C55E",
    btnTo: "#16A34A",
    btnText: "#fff",
  },
  v5: {
    segments: [
      { label: "$25,000", color: "#FF0000", textColor: "#FFD700" },
      { label: "Try Again", color: "#0D0D0D", textColor: "#FF0000" },
      { label: "$500", color: "#FFD700", textColor: "#000" },
      { label: "Try Again", color: "#0D0D0D", textColor: "#FFD700" },
      { label: "$1,000", color: "#FF0000", textColor: "#FFD700" },
      { label: "Try Again", color: "#0D0D0D", textColor: "#FF0000" },
      { label: "$250", color: "#FFD700", textColor: "#000" },
      { label: "Try Again", color: "#0D0D0D", textColor: "#FFD700" },
    ],
    borderColor: "#FF0000",
    centerColor: "#FFD700",
    btnFrom: "#FF0000",
    btnTo: "#FFD700",
    btnText: "#000",
  },
}

const WINNING_INDEX = 0

interface WheelProps {
  onWin: () => void
  variant?: string
  spinning: boolean
  hasSpun: boolean
  onSpin: () => void
}

export default function Wheel({
  onWin,
  variant = "v1",
  spinning,
  hasSpun,
  onSpin,
}: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rotationRef = useRef(0)
  const config = VARIANT_CONFIGS[variant as keyof typeof VARIANT_CONFIGS] ?? VARIANT_CONFIGS.v1
  const segmentAngle = (2 * Math.PI) / config.segments.length

  function drawWheel(rotation: number) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const radius = cx - 8

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Outer ring
    ctx.beginPath()
    ctx.arc(cx, cy, radius + 6, 0, 2 * Math.PI)
    ctx.fillStyle = config.borderColor
    ctx.fill()

    config.segments.forEach((seg, i) => {
      const startAngle = rotation + i * segmentAngle
      const endAngle = startAngle + segmentAngle

      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = seg.color
      ctx.fill()
      ctx.strokeStyle = config.borderColor
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(startAngle + segmentAngle / 2)
      ctx.textAlign = "right"
      ctx.fillStyle = seg.textColor
      ctx.font = "bold 12px sans-serif"
      ctx.fillText(seg.label, radius - 10, 5)
      ctx.restore()
    })

    // Center circle
    ctx.beginPath()
    ctx.arc(cx, cy, 22, 0, 2 * Math.PI)
    ctx.fillStyle = config.centerColor
    ctx.fill()
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 3
    ctx.stroke()

    // Star in center
    ctx.fillStyle = "#fff"
    ctx.font = "bold 14px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("★", cx, cy)
  }

  useEffect(() => {
    drawWheel(0)
  }, [variant])

  function handleSpin() {
    if (spinning || hasSpun) return
    onSpin()

    const extraSpins = 8
    const targetAngle =
      2 * Math.PI * extraSpins +
      (2 * Math.PI - WINNING_INDEX * segmentAngle - segmentAngle / 2)

    const duration = 4500
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
        setTimeout(() => onWin(), 600)
      }
    }

    requestAnimationFrame(animate)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        {/* Pointer */}
        <div
          className="absolute top-1/2 right-0 translate-x-3 -translate-y-1/2 z-10"
          style={{
            width: 0,
            height: 0,
            borderTop: "14px solid transparent",
            borderBottom: "14px solid transparent",
            borderRight: `28px solid ${config.borderColor}`,
            filter: "drop-shadow(0 0 4px rgba(0,0,0,0.5))",
          }}
        />
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="rounded-full"
          style={{ boxShadow: `0 0 32px ${config.borderColor}40` }}
        />
      </div>

      <motion.button
        onClick={handleSpin}
        disabled={spinning || hasSpun}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: spinning || hasSpun ? 1 : 1.05 }}
        className="px-12 py-4 rounded-full font-black text-xl shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed tracking-wide"
        style={{
          background:
            spinning || hasSpun
              ? "#555"
              : `linear-gradient(135deg, ${config.btnFrom}, ${config.btnTo})`,
          color: spinning || hasSpun ? "#999" : config.btnText,
          boxShadow:
            spinning || hasSpun
              ? "none"
              : `0 8px 32px ${config.btnFrom}60`,
        }}
      >
        {spinning ? "SPINNING..." : hasSpun ? "ENTERED!" : "SPIN TO WIN"}
      </motion.button>
    </div>
  )
}