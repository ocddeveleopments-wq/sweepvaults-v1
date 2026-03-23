import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import createIntlMiddleware from "next-intl/middleware"
import { NextResponse } from "next/server"

const locales = ["en", "fr"]
const defaultLocale = "en"

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
})

const isAdminRoute = createRouteMatcher(["/admin(.*)"])
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/en/(.*)",
  "/fr/(.*)",
  "/api/(.*)",
])

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl

  // Skip intl middleware for sign-in/sign-up and api routes
  if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up") || pathname.startsWith("/api")) {
    if (isAdminRoute(req)) {
      await auth.protect()
    }
    return NextResponse.next()
  }

  if (isAdminRoute(req)) {
    await auth.protect()
    return NextResponse.next()
  }

  return intlMiddleware(req)
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}