import { v4 as uuidv4 } from "uuid"

export function getSessionId(): string {
  if (typeof window === "undefined") return ""
  let sessionId = sessionStorage.getItem("sv_session")
  if (!sessionId) {
    sessionId = uuidv4()
    sessionStorage.setItem("sv_session", sessionId)
  }
  return sessionId
}

export function getVisitorId(): string {
  if (typeof window === "undefined") return ""
  let visitorId = localStorage.getItem("sv_visitor")
  if (!visitorId) {
    visitorId = uuidv4()
    localStorage.setItem("sv_visitor", visitorId)
  }
  return visitorId
}

export function isReturner(): boolean {
  if (typeof window === "undefined") return false
  // Must be called BEFORE getVisitorId() writes the key
  return localStorage.getItem("sv_visitor") !== null
}

export function getExitIntentShows(offerId: string): number {
  if (typeof window === "undefined") return 0
  const key = `sv_exit_${offerId}`
  return parseInt(localStorage.getItem(key) ?? "0", 10)
}

export function incrementExitIntentShows(offerId: string): void {
  if (typeof window === "undefined") return
  const key = `sv_exit_${offerId}`
  const current = getExitIntentShows(offerId)
  localStorage.setItem(key, String(current + 1))
}

export function getLastExitShown(offerId: string): number {
  if (typeof window === "undefined") return 0
  const key = `sv_exit_last_${offerId}`
  return parseInt(localStorage.getItem(key) ?? "0", 10)
}

export function setLastExitShown(offerId: string): void {
  if (typeof window === "undefined") return
  const key = `sv_exit_last_${offerId}`
  localStorage.setItem(key, String(Date.now()))
}