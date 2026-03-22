import posthog from "posthog-js"

let initialized = false

export function initPostHog() {
  if (typeof window === "undefined") return
  if (initialized) return
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false,
    persistence: "localStorage",
  })
  initialized = true
}

export function capture(
  event: string,
  properties?: Record<string, unknown>
) {
  if (typeof window === "undefined") return
  posthog.capture(event, properties)
}