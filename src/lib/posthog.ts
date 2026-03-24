let initialized = false

export function initPostHog() {
  if (typeof window === "undefined") return
  if (initialized) return

  // Defer PostHog init to after page load
  if (document.readyState === "complete") {
    loadPostHog()
  } else {
    window.addEventListener("load", loadPostHog, { once: true })
  }
}

function loadPostHog() {
  if (initialized) return
  initialized = true
  import("posthog-js").then(({ default: posthog }) => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageview: false,
      persistence: "localStorage",
      loaded: () => {
        initialized = true
      },
    })
  })
}

export function capture(event: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return
  import("posthog-js").then(({ default: posthog }) => {
    posthog.capture(event, properties)
  })
}