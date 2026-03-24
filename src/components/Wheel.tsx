"use client"

import { useEffect, useRef } from "react"

const VARIANT_CONFIGS = {
  v1: {
    segments: [
      { label: "$25,000", color: "#1a1200", textColor: "#FFD700" },
      { label: "Try Again", color: "#0d0d0d", textColor: "#666" },
      { label: "$500", color: "#1a1200", textColor: "#FFD700" },
      { label: "Try Again", color: "#111", textColor: "#666" },
      { label: "$1,000", color: "#FFD700", textColor: "#000" },
      { label: "Try Again", color: "#0d0d0d", textColor: "#666" },
      { label: "$250", color: "#CFB53B", textColor: "#000" },
      { label: "Try Again", color: "#111", textColor: "#666" },
    ],
    outerRing: "#FFD700",
    innerRing: "#8B6914",
    centerColor: "#FFD700",
    shadowColor: "rgba(255,215,0,0.4)",
  },
  v2: {
    segments: [
      { label: "$25,000", color: "#CC0000", textColor: "#fff" },
      { label: "Try Again", color: "#111", textColor: "#555" },
      { label: "$500", color: "#CC0000", textColor: "#fff" },
      { label: "Try Again", color: "#111", textColor: "#555" },
      { label: "$1,000", color: "#FF2222", textColor: "#fff" },
      { label: "Try Again", color: "#111", textColor: "#555" },
      { label: "$250", color: "#CC0000", textColor: "#fff" },
      { label: "Try Again", color: "#111", textColor: "#555" },
    ],
    outerRing: "#FF2222",
    innerRing: "#880000",
    centerColor: "#FF2222",
    shadowColor: "rgba(255,0,0,0.5)",
  },
  v3: {
    segments: [
      { label: "$25K", color: "#7C3AED", textColor: "#fff" },
      { label: "Try", color: "#1a1a2e", textColor: "#666" },
      { label: "$500", color: "#EC4899", textColor: "#fff" },
      { label: "Try", color: "#1a1a2e", textColor: "#666" },
      { label: "$1K", color: "#06B6D4", textColor: "#fff" },
      { label: "Try", color: "#1a1a2e", textColor: "#666" },
      { label: "$250", color: "#10B981", textColor: "#fff" },
      { label: "Try", color: "#1a1a2e", textColor: "#666" },
    ],
    outerRing: "#A855F7",
    innerRing: "#6D28D9",
    centerColor: "#7C3AED",
    shadowColor: "rgba(168,85,247,0.5)",
  },
  v4: {
    segments: [
      { label: "$25,000", color: "#059669", textColor: "#fff" },
      { label: "Try Again", color: "#f9fafb", textColor: "#aaa" },
      { label: "$500", color: "#059669", textColor: "#fff" },
      { label: "Try Again", color: "#f3f4f6", textColor: "#aaa" },
      { label: "$1,000", color: "#047857", textColor: "#fff" },
      { label: "Try Again", color: "#f9fafb", textColor: "#aaa" },
      { label: "$250", color: "#059669", textColor: "#fff" },
      { label: "Try Again", color: "#f3f4f6", textColor: "#aaa" },
    ],
    outerRing: "#059669",
    innerRing: "#047857",
    centerColor: "#059669",
    shadowColor: "rgba(5,150,105,0.3)",
  },
  v5: {
    segments: [
      { label: "$25,000", color: "#FF0000", textColor: "#FFD700" },
      { label: "Try Again", color: "#0a0000", textColor: "#440000" },
      { label: "$500", color: "#FFD700", textColor: "#000" },
      { label: "Try Again", color: "#0a0000", textColor: "#440000" },
      { label: "$1,000", color: "#FF0000", textColor: "#FFD700" },
      { label: "Try Again", color: "#0a0000", textColor: "#440000" },
      { label: "$250", color: "#FFD700", textColor: "#000" },
      { label: "Try Again", color: "#0a0000", textColor: "#440000" },
    ],
    outerRing: "#FF0000",
    innerRing: "#880000",
    centerColor: "#FF0000",
    shadowColor: "rgba(255,0,0,0.6)",
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

export default function Wheel({ onWin, variant = "v1", spinning, hasSpun, onSpin }: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rotationRef = useRef(0)
  const config = VARIANT_CONFIGS[variant as keyof typeof VARIANT_CONFIGS] ?? VARIANT_CONFIGS.v1
  const segmentAngle = (2 * Math.PI) / config.segments.length

  function drawWheel(rotation: number) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const size = canvas.width
    const cx = size / 2
    const cy = size / 2
    const radius = cx - 16

    ctx.clearRect(0, 0, size, size)

    // Shadow ellipse
    ctx.save()
    ctx.translate(cx, cy + 14)
    ctx.scale(1, 0.15)
    const shadowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
    shadowGrad.addColorStop(0, config.shadowColor)
    shadowGrad.addColorStop(1, "transparent")
    ctx.beginPath()
    ctx.arc(0, 0, radius, 0, 2 * Math.PI)
    ctx.fillStyle = shadowGrad
    ctx.fill()
    ctx.restore()

    // Outer ring
    ctx.beginPath()
    ctx.arc(cx, cy, radius + 12, 0, 2 * Math.PI)
    const outerGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius)
    outerGrad.addColorStop(0, config.outerRing)
    outerGrad.addColorStop(0.5, config.innerRing)
    outerGrad.addColorStop(1, config.outerRing)
    ctx.fillStyle = outerGrad
    ctx.fill()

    ctx.beginPath()
    ctx.arc(cx, cy, radius + 4, 0, 2 * Math.PI)
    ctx.fillStyle = config.innerRing
    ctx.fill()

    // Segments
    config.segments.forEach((seg, i) => {
      const startAngle = rotation + i * segmentAngle
      const endAngle = startAngle + segmentAngle
      const midAngle = startAngle + segmentAngle / 2

      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = seg.color
      ctx.fill()
      ctx.strokeStyle = config.outerRing
      ctx.lineWidth = 1
      ctx.stroke()

      const highlight = Math.max(0, Math.sin(midAngle + Math.PI / 2) * 0.12)
      if (highlight > 0) {
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.arc(cx, cy, radius, startAngle, endAngle)
        ctx.closePath()
        ctx.fillStyle = `rgba(255,255,255,${highlight})`
        ctx.fill()
      }

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(midAngle)
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      const isShort = seg.label.length <= 4
      const isMedium = seg.label.length <= 7
      const fontSize = isShort ? 16 : isMedium ? 14 : 12
      ctx.font = `900 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`
      ctx.shadowColor = "rgba(0,0,0,0.9)"
      ctx.shadowBlur = 6
      ctx.fillStyle = seg.textColor
      ctx.fillText(seg.label, radius * 0.62, 0)
      ctx.shadowBlur = 0
      ctx.restore()
    })

    // Center circle
    const centerGrad = ctx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, 28)
    centerGrad.addColorStop(0, "#fff")
    centerGrad.addColorStop(1, config.centerColor)
    ctx.beginPath()
    ctx.arc(cx, cy, 28, 0, 2 * Math.PI)
    ctx.fillStyle = centerGrad
    ctx.fill()
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.fillStyle = "#fff"
    ctx.font = "bold 18px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.shadowColor = "rgba(0,0,0,0.5)"
    ctx.shadowBlur = 4
    ctx.fillText("★", cx, cy)
    ctx.shadowBlur = 0

    for (let i = 0; i < config.segments.length; i++) {
      const angle = rotation + i * segmentAngle
      ctx.beginPath()
      ctx.moveTo(cx + (radius + 4) * Math.cos(angle), cy + (radius + 4) * Math.sin(angle))
      ctx.lineTo(cx + (radius + 12) * Math.cos(angle), cy + (radius + 12) * Math.sin(angle))
      ctx.strokeStyle = config.innerRing
      ctx.lineWidth = 2
      ctx.stroke()
    }
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
      rotationRef.current = startRotation + targetAngle * eased
      drawWheel(rotationRef.current)
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setTimeout(() => onWin(), 600)
      }
    }

    requestAnimationFrame(animate)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
      <div style={{ position: "relative" }}>
        <div style={{
          position: "absolute",
          top: "50%",
          right: "-4px",
          transform: "translateY(-50%)",
          zIndex: 10,
          filter: `drop-shadow(0 0 6px ${config.outerRing})`,
        }}>
          <svg width="32" height="32" viewBox="0 0 32 32">
            <polygon points="32,16 8,6 12,16 8,26" fill={config.outerRing} />
            <polygon points="32,16 8,6 12,16 8,26" fill="none" stroke="#fff" strokeWidth="1" />
          </svg>
        </div>

        <div style={{
          position: "absolute",
          inset: "-20px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${config.shadowColor} 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          style={{
            borderRadius: "50%",
            display: "block",
            position: "relative",
            zIndex: 1,
            width: "min(300px, 75vw)",
            height: "min(300px, 75vw)",
          }}
        />
      </div>

      <button
        onClick={handleSpin}
        disabled={spinning || hasSpun}
        style={{
          padding: "16px 48px",
          borderRadius: "50px",
          fontWeight: 900,
          fontSize: "18px",
          border: "none",
          cursor: spinning || hasSpun ? "not-allowed" : "pointer",
          letterSpacing: "0.08em",
          fontFamily: "var(--font-oswald), sans-serif",
          background: spinning || hasSpun
            ? "#333"
            : `linear-gradient(135deg, ${config.outerRing}, ${config.innerRing})`,
          color: spinning || hasSpun ? "#666" : "#fff",
          boxShadow: spinning || hasSpun
            ? "none"
            : `0 8px 32px ${config.shadowColor}, 0 2px 8px rgba(0,0,0,0.4)`,
          transition: "transform 0.1s, opacity 0.2s",
          textShadow: "0 1px 3px rgba(0,0,0,0.5)",
          textTransform: "uppercase" as const,
        }}
        onMouseDown={(e) => { if (!spinning && !hasSpun) (e.currentTarget as HTMLElement).style.transform = "scale(0.95)" }}
        onMouseUp={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)" }}
        onTouchStart={(e) => { if (!spinning && !hasSpun) (e.currentTarget as HTMLElement).style.transform = "scale(0.95)" }}
        onTouchEnd={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)" }}
      >
        {spinning ? "SPINNING..." : hasSpun ? "ENTERED! ✓" : "🎰 SPIN TO WIN FREE"}
      </button>
    </div>
  )
}