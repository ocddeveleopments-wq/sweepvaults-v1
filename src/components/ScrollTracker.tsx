"use client"

import { useEffect, useRef } from "react"
import { capture } from "@/lib/posthog"
import { trackEvent } from "@/app/actions"

interface ScrollTrackerProps {
  offerId: string
  variant: string
  locale: string
  sessionId: string
  visitorId: string
}

export default function ScrollTracker({
  offerId,
  variant,
  locale,
  sessionId,
  visitorId,
}: ScrollTrackerProps) {
  const fired = useRef<Set<number>>(new Set())
  const maxDepth = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const depth = Math.round(
        (window.scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1)) * 100
      )

      if (depth > maxDepth.current) {
        maxDepth.current = depth
      }

      const checkpoints = [25, 50, 75, 90]
      checkpoints.forEach((cp) => {
        if (depth >= cp && !fired.current.has(cp)) {
          fired.current.add(cp)
          capture(`scroll_${cp}`, { offerId, variant, depth: cp })
          trackEvent({
            event: `scroll_${cp}`,
            offerId,
            locale,
            variant,
            depth: cp,
            sessionId,
            visitorId,
          })
        }
      })
    }

    const handleUnload = () => {
      capture("max_scroll_depth", { offerId, variant, depth: maxDepth.current })
      trackEvent({
        event: "max_scroll_depth",
        offerId,
        locale,
        variant,
        depth: maxDepth.current,
        sessionId,
        visitorId,
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("beforeunload", handleUnload)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("beforeunload", handleUnload)
    }
  }, [offerId, variant, locale, sessionId, visitorId])

  return null
}